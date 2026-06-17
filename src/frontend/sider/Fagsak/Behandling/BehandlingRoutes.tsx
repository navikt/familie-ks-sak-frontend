import { NotFound } from '@komponenter/Error/NotFound';
import { TidslinjeProvider } from '@komponenter/Tidslinje/TidslinjeContext';
import Behandlingsresultat from '@sider/Fagsak/Behandling/sider/Behandlingsresultat/Behandlingsresultat';
import RegistrerSøknad from '@sider/Fagsak/Behandling/sider/RegistrerSøknad/RegistrerSøknad';
import { SøknadProvider } from '@sider/Fagsak/Behandling/sider/RegistrerSøknad/SøknadContext';
import Simulering from '@sider/Fagsak/Behandling/sider/Simulering/Simulering';
import { SimuleringProvider } from '@sider/Fagsak/Behandling/sider/Simulering/SimuleringContext';
import { Vedtak } from '@sider/Fagsak/Behandling/sider/Vedtak/Vedtak';
import { VedtakContainer } from '@sider/Fagsak/Behandling/sider/Vedtak/VedtakContainer';
import { EkspanderbareVilkårResultatRaderProvider } from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/EkspanderbareVilkårResultatRaderContext';
import { EkspanderbareVilkårsvurderingPanelerProvider } from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/EkspanderbareVilkårsvurderingPanelerContext';
import { Vilkårsvurdering } from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/Vilkårsvurdering';
import { VilkårsvurderingProvider } from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/VilkårsvurderingContext';
import { type RouteObject } from 'react-router';

export const behandlingRoutes: RouteObject[] = [
    {
        path: 'registrer-soknad',
        element: (
            <SøknadProvider>
                <RegistrerSøknad />
            </SøknadProvider>
        ),
    },
    {
        path: 'vilkaarsvurdering',
        element: (
            <VilkårsvurderingProvider>
                <EkspanderbareVilkårsvurderingPanelerProvider>
                    <EkspanderbareVilkårResultatRaderProvider>
                        <Vilkårsvurdering />
                    </EkspanderbareVilkårResultatRaderProvider>
                </EkspanderbareVilkårsvurderingPanelerProvider>
            </VilkårsvurderingProvider>
        ),
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
