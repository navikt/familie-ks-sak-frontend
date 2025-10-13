import type { IApi, ISessionKonfigurasjon } from '@navikt/familie-backend';

import { envVar, erLokal } from './env.js';

export const frontendPath = envVar('FRONTEND_PATH');
export const proxyUrl = envVar('PROXY_URL');

export const sessionConfig: ISessionKonfigurasjon = {
    cookieSecret: [`${envVar('COOKIE_KEY1')}`, `${envVar('COOKIE_KEY2')}`],
    navn: 'familie-ks-sak-v1',
    redisFullUrl: envVar('VALKEY_URI_SESSIONS', false),
    redisBrukernavn: envVar('VALKEY_USERNAME_SESSIONS', false),
    redisPassord: envVar('VALKEY_PASSWORD_SESSIONS', false),
    secureCookie: !erLokal(),
    sessionMaxAgeSekunder: 12 * 60 * 60,
};

export const oboConfig: IApi = {
    clientId: envVar('AZURE_APP_CLIENT_ID'),
    scopes: [envVar('KS_SAK_SCOPE')],
};

export const redirectRecords: Record<string, string> = {
    '/redirect/familie-tilbake': envVar('FAMILIE_TILBAKE_URL'),
    '/redirect/familie-klage': envVar('FAMILIE_KLAGE_URL'),
    '/redirect/neessi': envVar('NEESSI_URL'),
    '/redirect/drek': envVar('DREK_URL'),
};
