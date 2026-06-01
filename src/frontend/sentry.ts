import { apiClient } from '@api/client/apiClient';
import * as Sentry from '@sentry/browser';

const environment = window.location.hostname;

export function initSentry() {
    try {
        Sentry.init({
            dsn: 'https://e15fa1f00e3e445887790956a0d8bbe2@sentry.gc.nav.no/146',
            environment,
            integrations: [Sentry.browserTracingIntegration()],
            tracesSampleRate: 0.2,
        });

        apiClient.addResponseInterceptor({
            onRejected: error => {
                Sentry.captureException(error, {
                    extra: {
                        response: {
                            callId: error.response?.headers['nav-call-id'],
                            status: error.response?.status,
                            statusText: error.response?.statusText,
                        },
                    },
                });
                return Promise.reject(error);
            },
        });
    } catch (e) {
        console.error('Sentry feilet ved initialisering', e);
    }
}
