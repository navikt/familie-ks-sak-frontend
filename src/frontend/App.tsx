import '@navikt/ds-css';

import { useEffect, useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import type { ISaksbehandler } from '@navikt/familie-typer';

import { hentInnloggetBruker } from './api/saksbehandler';
import Container from './Container';
import { AppProvider } from './context/AppContext';
import { AuthOgHttpProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import ErrorBoundary from './komponenter/ErrorBoundary/ErrorBoundary';
import { initGrafanaFaro } from './utils/grafanaFaro';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false, // Fungerer ikke så bra med global "Systemet laster" spinner, på sikt kan vi kanskje enable retries
        },
    },
});

const App = () => {
    const [autentisertSaksbehandler, settInnloggetSaksbehandler] = useState<ISaksbehandler | undefined>(undefined);

    useEffect(() => {
        initGrafanaFaro();
        hentInnloggetBruker().then((innhentetInnloggetSaksbehandler: ISaksbehandler) => {
            settInnloggetSaksbehandler(innhentetInnloggetSaksbehandler);
        });
    }, []);

    return (
        <ErrorBoundary autentisertSaksbehandler={autentisertSaksbehandler}>
            <AuthOgHttpProvider autentisertSaksbehandler={autentisertSaksbehandler}>
                <QueryClientProvider client={queryClient}>
                    <ReactQueryDevtools position={'right'} initialIsOpen={false} />
                    <AppProvider>
                        <ModalProvider>
                            <Container />
                        </ModalProvider>
                    </AppProvider>
                </QueryClientProvider>
            </AuthOgHttpProvider>
        </ErrorBoundary>
    );
};

export default App;
