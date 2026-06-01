import { useEffect } from 'react';

import { TidslinjeProvider } from '@komponenter/Tidslinje/TidslinjeContext';
import { hentSideHref } from '@utils/miljø';
import { Route, Routes, useLocation } from 'react-router';

import { useBehandlingContext } from './context/BehandlingContext';
import Behandlingsresultat from './sider/Behandlingsresultat/Behandlingsresultat';
import RegistrerSøknad from './sider/RegistrerSøknad/RegistrerSøknad';
import { SøknadProvider } from './sider/RegistrerSøknad/SøknadContext';
import { type SideId, sider } from './sider/sider';
import Simulering from './sider/Simulering/Simulering';
import { SimuleringProvider } from './sider/Simulering/SimuleringContext';
import { FeilutbetaltValutaTabellProvider } from './sider/Vedtak/FeilutbetaltValuta/FeilutbetaltValutaTabellContext';
import { RefusjonEøsTabellProvider } from './sider/Vedtak/RefusjonEøs/RefusjonEøsTabellContext';
import { SammensattKontrollsakProvider } from './sider/Vedtak/SammensattKontrollsak/SammensattKontrollsakContext';
import { Vedtak } from './sider/Vedtak/Vedtak';
import { Vilkårsvurdering } from './sider/Vilkårsvurdering/Vilkårsvurdering';
import { VilkårsvurderingProvider } from './sider/Vilkårsvurdering/VilkårsvurderingContext';

export function BehandlingRouter() {
    const { leggTilBesøktSide } = useBehandlingContext();

    const location = useLocation();

    const sidevisning = hentSideHref(location.pathname);

    useEffect(() => {
        if (sidevisning) {
            leggTilBesøktSide(Object.entries(sider).find(([_, side]) => side.href === sidevisning)?.[0] as SideId);
        }
    }, [sidevisning]);

    return (
        <Routes>
            <Route
                path="/registrer-soknad"
                element={
                    <SøknadProvider>
                        <RegistrerSøknad />
                    </SøknadProvider>
                }
            />
            <Route
                path="/vilkaarsvurdering"
                element={
                    <VilkårsvurderingProvider>
                        <Vilkårsvurdering />
                    </VilkårsvurderingProvider>
                }
            />
            <Route
                path="/tilkjent-ytelse"
                element={
                    <TidslinjeProvider>
                        <Behandlingsresultat />
                    </TidslinjeProvider>
                }
            />
            <Route
                path="/simulering"
                element={
                    <SimuleringProvider>
                        <Simulering />
                    </SimuleringProvider>
                }
            />
            <Route
                path="/vedtak"
                element={
                    <FeilutbetaltValutaTabellProvider>
                        <RefusjonEøsTabellProvider>
                            <SammensattKontrollsakProvider>
                                <Vedtak />
                            </SammensattKontrollsakProvider>
                        </RefusjonEøsTabellProvider>
                    </FeilutbetaltValutaTabellProvider>
                }
            />
        </Routes>
    );
}
