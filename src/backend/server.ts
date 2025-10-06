import './konfigurerApp.js';

import path from 'path';

import bodyParser from 'body-parser';
import express, { type NextFunction, type Request, type Response } from 'express';
import expressStaticGzip from 'express-static-gzip';
import { v4 as uuidv4 } from 'uuid';

import type { IApp } from '@navikt/familie-backend';
import { default as backend, ensureAuthenticated, envVar } from '@navikt/familie-backend';
import { logInfo } from '@navikt/familie-logging';

import { frontendPath } from './config.js';
import { sessionConfig } from './config.js';
import { prometheusTellere } from './metrikker.js';
import { attachToken, doProxy, doRedirectProxy } from './proxy.js';
import setupRouter from './router.js';

const port = 8000;

backend(sessionConfig, prometheusTellere).then(async ({ app, azureAuthClient, router }: IApp) => {
    app.use((req: Request, _res: Response, next: NextFunction) => {
        req.headers['nav-call-id'] = uuidv4();
        req.headers['nav-consumer-id'] = 'familie-ks-sak-front';
        next();
    });

    if (process.env.NODE_ENV === 'production') {
        app.use('/assets', expressStaticGzip(path.join(process.cwd(), frontendPath, '/assets'), {}));
    }
    app.use('/favicon.svg', express.static(path.join(process.cwd(), frontendPath, '/favicon.svg'), {}));

    app.use('/familie-ks-sak/api', ensureAuthenticated(azureAuthClient, true), attachToken(azureAuthClient), doProxy());

    app.use('/redirect', doRedirectProxy());

    // Sett opp bodyParser og router etter proxy. Spesielt viktig med tanke på større payloads som blir parset av bodyParser
    app.use(bodyParser.json({ limit: '200mb' }));
    app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));
    app.use('/', await setupRouter(azureAuthClient, router));

    app.listen(port, '0.0.0.0', () => {
        logInfo(`Server startet på port ${port}. Build version: ${envVar('APP_VERSION')}.`);
    });
});
