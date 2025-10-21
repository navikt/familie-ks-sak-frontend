import { StrictMode } from 'react';
// eslint-disable-next-line no-restricted-syntax
import React from 'react';

import axe from '@axe-core/react';
import * as Sentry from '@sentry/browser';
import { setDefaultOptions } from 'date-fns';
import { nb } from 'date-fns/locale';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';

import App from './App';
import { erLokal } from './utils/miljø';

// Setter default locale til norsk bokmål for date-fns
setDefaultOptions({ locale: nb });

const environment = window.location.hostname;

console.log(import.meta.env);

if (!erLokal()) {
    try {
        Sentry.init({
            dsn: 'https://e15fa1f00e3e445887790956a0d8bbe2@sentry.gc.nav.no/146',
            environment,
            integrations: [Sentry.browserTracingIntegration()],
            tracesSampleRate: 0.2,
        });
    } catch (e) {
        console.error('Sentry init feilet', e);
    }
}

if (erLokal()) {
    axe(React, ReactDOM, 1000);
}

const container = document.getElementById('app');
const root = createRoot(container!);

root.render(
    <StrictMode>
        <App />
    </StrictMode>
);
