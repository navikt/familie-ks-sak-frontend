import '@navikt/ds-css';

import { useEffect } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import Container from './Container';
import { AppProvider } from './context/AppContext';
import { AuthContextProvider } from './context/AuthContext';
import { FeatureTogglesProvider } from './context/FeatureTogglesContext';
import { HttpContextProvider } from './context/HttpContext';
import { ModalProvider } from './context/ModalContext';
import { GlobalErrorBoundary } from './komponenter/ErrorBoundary/GlobalErrorBoundary';
import { SaksbehandlerErrorBoundary } from './komponenter/ErrorBoundary/SaksbehandlerErrorBoundary';
import { SaksbehandlerProvider } from './SaksbehandlerProvider';
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
    useEffect(() => {
        initGrafanaFaro();
    }, []);

    return (
        <GlobalErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <SaksbehandlerProvider>
                    <SaksbehandlerErrorBoundary>
                        <AuthContextProvider>
                            <HttpContextProvider>
                                {!erProd() && <ReactQueryDevtools position={'right'} initialIsOpen={false} />}
                                <FeatureTogglesProvider>
                                    <AppProvider>
                                        <ModalProvider>
                                            <Container />
                                        </ModalProvider>
                                    </AppProvider>
                                </FeatureTogglesProvider>
                            </HttpContextProvider>
                        </AuthContextProvider>
                    </SaksbehandlerErrorBoundary>
                </SaksbehandlerProvider>
            </QueryClientProvider>
        </GlobalErrorBoundary>
    );
};

export default App;
