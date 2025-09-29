import console from 'console';
import process from 'process';

import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        // Sentry må være siste plugin
        sentryVitePlugin({
            org: 'nav',
            project: 'familie-ks-sak-frontend',
            authToken: process.env.SENTRY_AUTH_TOKEN,
            url: 'https://sentry.gc.nav.no/',
            release: {
                name: process.env.SENTRY_RELEASE,
                uploadLegacySourcemaps: {
                    paths: ['./frontend'],
                    ignore: ['./node_modules'],
                    urlPrefix: `~/assets`,
                },
            },
            errorHandler: err => {
                console.warn('Sentry CLI Plugin: ' + err.message);
            },
        }),
    ],
    server: {
        port: 8000,
    },
    define: {
        global: 'window',
    },
    build: {
        outDir: '../../dist/frontend/',
        sourcemap: true,
        emptyOutDir: true,
    },
});
