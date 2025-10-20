import console from 'console';
import process from 'process';

import { sentryVitePlugin } from '@sentry/vite-plugin';
import reactPlugin from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
    return {
        build: {
            outDir: '../../dist_frontend/',
            sourcemap: true,
            emptyOutDir: true,
        },
        envDir: '../../',
        define: {
            global: 'window',
        },
        server: {
            port: 8000,
        },
        plugins: [
            reactPlugin(),
            mode === 'prod' || mode === 'preprod' ? sentryPlugin() : undefined, // Sentry må være siste plugin
        ],
    };
});

const sentryPlugin = () => {
    try {
        return sentryVitePlugin({
            org: 'nav',
            project: 'familie-ks-sak-frontend',
            authToken: process.env.SENTRY_AUTH_TOKEN,
            url: 'https://sentry.gc.nav.no/',
            release: {
                name: process.env.SENTRY_RELEASE,
                uploadLegacySourcemaps: {
                    paths: ['./dist_frontend'],
                    ignore: ['./node_modules'],
                    urlPrefix: `~/assets`,
                },
            },
            errorHandler: err => {
                console.warn('Sentry CLI Plugin: ' + err.message);
            },
        });
    } catch (e) {
        console.error('Klarte ikke starte Sentry', e);
    }
};
