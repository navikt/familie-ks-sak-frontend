import Backend from '@navikt/familie-backend';
import { NextFunction, Request, Response } from 'express';
import { ClientRequest } from 'http';
import proxy from 'http-proxy-middleware';
import uuid from 'uuid';
import { oboTokenConfig, proxyUrl, saksbehandlerTokenConfig } from './config';

const restream = (proxyReq: ClientRequest, req: Request, res: Response) => {
    if (req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
    }
};

export const doProxy = () => {
    return proxy('/familie-ks-sak/api', {
        changeOrigin: true,
        logLevel: 'info',
        onProxyReq: restream,
        pathRewrite: (path, req) => {
            const newPath = path.replace('/familie-ks-sak/api', '');
            return `/api${newPath}`;
        },
        secure: true,
        target: `${proxyUrl}`,
    });
};

export const attachToken = (backend: Backend) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const accessToken = await backend.validerEllerOppdaterOnBehalfOfToken(
            req,
            saksbehandlerTokenConfig,
            oboTokenConfig
        );
        req.headers['Nav-Call-Id'] = uuid.v1();
        req.headers.Authorization = `Bearer ${accessToken}`;
        return next();
    };
};
