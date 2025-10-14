import dotenvx from '@dotenvx/dotenvx';

import { logInfo } from '@navikt/familie-logging';

import { envVar } from './env.js';

const konfigurerApp = () => {
    logInfo(`NODE_ENV=${process.env.NODE_ENV} ENV=${process.env.ENV}, CLUSTER=${process.env.CLUSTER}`);

    dotenvx.config({
        path: ['.env', '.secrets.env', `.env.${envVar('ENV')}`],
        ignore: ['MISSING_ENV_FILE'],
    });

    // felles-backend bruker andre variabler enn det som blir satt opp av azureAd
    process.env.AAD_DISCOVERY_URL = envVar('AZURE_APP_WELL_KNOWN_URL');
    process.env.CLIENT_ID = envVar('AZURE_APP_CLIENT_ID');
    process.env.CLIENT_SECRET = envVar('AZURE_APP_CLIENT_SECRET');
};

konfigurerApp();
