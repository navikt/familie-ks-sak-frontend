import { NotFound } from '@komponenter/Error/NotFound';
import { TidslinjeProvider } from '@komponenter/Tidslinje/TidslinjeContext';
import Behandlingsresultat from '@sider/Fagsak/Behandling/sider/Behandlingsresultat/Behandlingsresultat';
import { RegistrerSøknad } from '@sider/Fagsak/Behandling/sider/RegistrerSøknad/RegistrerSøknad';
import Simulering from '@sider/Fagsak/Behandling/sider/Simulering/Simulering';
import { SimuleringProvider } from '@sider/Fagsak/Behandling/sider/Simulering/SimuleringContext';
import { Vedtak } from '@sider/Fagsak/Behandling/sider/Vedtak/Vedtak';
import { VedtakContainer } from '@sider/Fagsak/Behandling/sider/Vedtak/VedtakContainer';
import { VilkårsvurderingContainer } from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/VilkårsvurderingContainer';
import { type RouteObject } from 'react-router';

export const behandlingRoutes: RouteObject[] = [
    {
        path: 'registrer-soknad',
        element: <RegistrerSøknad />,
    },
    {
        path: 'vilkaarsvurdering',
        element: <VilkårsvurderingContainer />,
    },
    {
        path: 'tilkjent-ytelse',
        element: (
            <TidslinjeProvider>
                <Behandlingsresultat />
            </TidslinjeProvider>
        ),
    },
    {
        path: 'simulering',
        element: (
            <SimuleringProvider>
                <Simulering />
            </SimuleringProvider>
        ),
    },
    {
        path: 'vedtak',
        element: (
            <VedtakContainer>
                <Vedtak />
            </VedtakContainer>
        ),
    },
    {
        path: '*',
        element: <NotFound />,
    },
];
