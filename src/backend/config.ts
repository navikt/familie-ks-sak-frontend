// Konfigurer appen før backend prøver å sette opp konfigurasjon

import type { IApi, ISessionKonfigurasjon } from '@navikt/familie-backend';
import { appConfig } from '@navikt/familie-backend';

const Environment = () => {
    if (process.env.ENV === 'local') {
        return {
            buildPath: 'frontend_development',
            namespace: 'local',
            proxyUrl: 'http://localhost:8083/api',
            familieTilbakeUrl: 'http://localhost:8000',
            familieKlageUrl: 'http://localhost:8000',
        };
    } else if (process.env.ENV === 'lokalt-mot-preprod') {
        return {
            buildPath: 'frontend_development',
            namespace: 'local',
            proxyUrl: 'https://familie-kontantstotte-sak.intern.dev.nav.no/api',
            familieTilbakeUrl: 'https://tilbakekreving.ansatt.dev.nav.no',
            familieKlageUrl: 'https://familie-klage.intern.dev.nav.no',
        };
    } else if (process.env.ENV === 'e2e') {
        return {
            buildPath: 'frontend_production',
            namespace: 'e2e',
            proxyUrl: 'http://familie-ks-sak:8089/api',
            familieTilbakeUrl: 'http://tilbakekreving:8000',
            familieKlageUrl: '',
        };
    } else if (process.env.ENV === 'preprod') {
        return {
            buildPath: 'frontend_production',
            namespace: 'preprod',
            proxyUrl: 'http://familie-ks-sak/api',
            familieTilbakeUrl: 'https://tilbakekreving.ansatt.dev.nav.no',
            familieKlageUrl: 'https://familie-klage.intern.dev.nav.no',
        };
    }

    return {
        buildPath: 'frontend_production',
        namespace: 'production',
        proxyUrl: 'http://familie-ks-sak/api',
        familieTilbakeUrl: 'https://tilbakekreving.intern.nav.no',
        familieKlageUrl: 'https://familie-klage.intern.nav.no',
    };
};
const env = Environment();

export const sessionConfig: ISessionKonfigurasjon = {
    cookieSecret: [`${process.env.COOKIE_KEY1}`, `${process.env.COOKIE_KEY2}`],
    navn: 'familie-ks-sak-v1',
    redisFullUrl: process.env.VALKEY_URI_SESSIONS,
    redisBrukernavn: process.env.VALKEY_USERNAME_SESSIONS,
    redisPassord: process.env.VALKEY_PASSWORD_SESSIONS,
    secureCookie: !(
        process.env.ENV === 'local' ||
        process.env.ENV === 'lokalt-mot-preprod' ||
        process.env.ENV === 'e2e'
    ),
    sessionMaxAgeSekunder: 12 * 60 * 60,
};

if (!process.env.KS_SAK_SCOPE) {
    throw new Error('Scope mot familie-ks-sak er ikke konfigurert');
}

if (!process.env.DREK_URL) {
    throw new Error('URL til Drek er ikke konfigurert');
}

export const oboConfig: IApi = {
    clientId: appConfig.clientId,
    scopes: [process.env.KS_SAK_SCOPE],
};

export const buildPath = env.buildPath;
export const proxyUrl = env.proxyUrl;

export const redirectRecords: Record<string, string> = {
    '/redirect/familie-tilbake': env.familieTilbakeUrl,
    '/redirect/familie-klage': env.familieKlageUrl,
    '/redirect/drek': process.env.DREK_URL,
};
