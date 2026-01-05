import '@navikt/ds-css';

import { useEffect, useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import type { ISaksbehandler } from '@navikt/familie-typer';

import { hentInnloggetBruker } from './api/saksbehandler';
import Container from './Container';
import { AppProvider } from './context/AppContext';
import { AuthContextProvider } from './context/AuthContext';
import { FeatureTogglesProvider } from './context/FeatureTogglesContext';
import { HttpContextProvider } from './context/HttpContext';
import { ModalProvider } from './context/ModalContext';
import { ErrorBoundary } from './komponenter/ErrorBoundary/ErrorBoundary';
import { initGrafanaFaro } from './utils/grafanaFaro';
import { erProd } from './utils/miljø';

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
            <AuthContextProvider autentisertSaksbehandler={autentisertSaksbehandler}>
                <HttpContextProvider>
                    <QueryClientProvider client={queryClient}>
                        {!erProd() && <ReactQueryDevtools position={'right'} initialIsOpen={false} />}
                        <FeatureTogglesProvider>
                            <AppProvider>
                                <ModalProvider>
                                    <Container />
                                </ModalProvider>
                            </AppProvider>
                        </FeatureTogglesProvider>
                    </QueryClientProvider>
                </HttpContextProvider>
            </AuthContextProvider>
        </ErrorBoundary>
    );
};

export default App;
