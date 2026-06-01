import { TidslinjeProvider } from '@komponenter/Tidslinje/TidslinjeContext';
import Behandlingsresultat from '@sider/Fagsak/Behandling/sider/Behandlingsresultat/Behandlingsresultat';
import RegistrerSøknad from '@sider/Fagsak/Behandling/sider/RegistrerSøknad/RegistrerSøknad';
import { SøknadProvider } from '@sider/Fagsak/Behandling/sider/RegistrerSøknad/SøknadContext';
import Simulering from '@sider/Fagsak/Behandling/sider/Simulering/Simulering';
import { SimuleringProvider } from '@sider/Fagsak/Behandling/sider/Simulering/SimuleringContext';
import { FeilutbetaltValutaTabellProvider } from '@sider/Fagsak/Behandling/sider/Vedtak/FeilutbetaltValuta/FeilutbetaltValutaTabellContext';
import { RefusjonEøsTabellProvider } from '@sider/Fagsak/Behandling/sider/Vedtak/RefusjonEøs/RefusjonEøsTabellContext';
import { SammensattKontrollsakProvider } from '@sider/Fagsak/Behandling/sider/Vedtak/SammensattKontrollsak/SammensattKontrollsakContext';
import { Vedtak } from '@sider/Fagsak/Behandling/sider/Vedtak/Vedtak';
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
                <Vilkårsvurdering />
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
            <FeilutbetaltValutaTabellProvider>
                <RefusjonEøsTabellProvider>
                    <SammensattKontrollsakProvider>
                        <Vedtak />
                    </SammensattKontrollsakProvider>
                </RefusjonEøsTabellProvider>
            </FeilutbetaltValutaTabellProvider>
        ),
    },
];
