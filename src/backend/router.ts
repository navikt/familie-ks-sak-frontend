import fs from 'fs';
import path from 'path';

import type { Response, Request, Router, NextFunction } from 'express';
import { type ViteDevServer, createServer } from 'vite';

import type { Client } from '@navikt/familie-backend';
import { ensureAuthenticated, logRequest, envVar } from '@navikt/familie-backend';
import { LOG_LEVEL } from '@navikt/familie-logging';

import { frontendPath } from './config.js';
import { prometheusTellere } from './metrikker.js';

const redirectHvisInternUrlIPreprod = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (process.env.ENV === 'preprod' && req.headers.host === 'kontantstotte.intern.dev.nav.no') {
            res.redirect(`https://kontantstotte.ansatt.dev.nav.no${req.url}`);
        } else {
            next();
        }
    };
};

export default async (authClient: Client, router: Router) => {
    router.get('/version', (_: Request, res: Response) => {
        res.status(200)
            .send({ status: 'SUKSESS', data: envVar('APP_VERSION') })
            .end();
    });

    router.get('/error', (_: Request, res: Response) => {
        prometheusTellere.errorRoute.inc();
        res.sendFile('error.html', { root: path.join(`assets/`) });
    });

    // Feilhåndtering
    router.post('/logg-feil', (req: Request, res: Response) => {
        logRequest(req, req.body.melding, LOG_LEVEL.ERROR);
        res.status(200).send();
    });

    let vite: ViteDevServer;
    if (process.env.NODE_ENV === 'development') {
        vite = await createServer({
            root: path.join(process.cwd(), frontendPath),
            server: { middlewareMode: true },
            appType: 'custom',
        });
        router.use(vite.middlewares);
    }

    // APP
    router.get(
        '*splat',
        redirectHvisInternUrlIPreprod(),
        ensureAuthenticated(authClient, false),
        async (req: Request, res: Response) => {
            prometheusTellere.appLoad.inc();

            const htmlPath = path.join(process.cwd(), frontendPath, 'index.html');
            let htmlInnhold = fs.readFileSync(htmlPath, 'utf-8');

            if (process.env.NODE_ENV === 'development') {
                htmlInnhold = await vite.transformIndexHtml(req.url, htmlInnhold);
            }

            res.status(200).type('html').send(htmlInnhold);
        }
    );

    return router;
};
