import React from 'react';

import axe from '@axe-core/react';
import * as Sentry from '@sentry/browser';
import { setDefaultOptions } from 'date-fns';
import { nb } from 'date-fns/locale';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';

import App from './komponenter/App';

// eslint-disable-next-line
require('../../package.json');

// Setter default locale til norsk bokmål for date-fns
setDefaultOptions({ locale: nb });

const environment = window.location.hostname;

if (process.env.NODE_ENV !== 'development') {
    Sentry.init({
        dsn: 'https://e15fa1f00e3e445887790956a0d8bbe2@sentry.gc.nav.no/146',
        environment,
        integrations: [Sentry.browserTracingIntegration()],
        tracesSampleRate: 0.2,
    });
}

if (process.env.NODE_ENV !== 'production') {
    axe(React, ReactDOM, 1000);
}

const container = document.getElementById('app');
const root = createRoot(container!);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
