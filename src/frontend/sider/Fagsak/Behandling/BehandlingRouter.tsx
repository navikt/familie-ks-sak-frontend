import { useEffect } from 'react';

import { Route, Routes, useLocation } from 'react-router';

import { useBrukerContext } from '../BrukerContext';
import { useBehandlingContext } from './context/BehandlingContext';
import Behandlingsresultat from './sider/Behandlingsresultat/Behandlingsresultat';
import RegistrerSøknad from './sider/RegistrerSøknad/RegistrerSøknad';
import { SøknadProvider } from './sider/RegistrerSøknad/SøknadContext';
import { type SideId, sider } from './sider/sider';
import Simulering from './sider/Simulering/Simulering';
import { SimuleringProvider } from './sider/Simulering/SimuleringContext';
import { FeilutbetaltValutaTabellProvider } from './sider/Vedtak/FeilutbetaltValuta/FeilutbetaltValutaTabellContext';
import { SammensattKontrollsakProvider } from './sider/Vedtak/SammensattKontrollsak/SammensattKontrollsakContext';
import Vedtak from './sider/Vedtak/Vedtak';
import { Vilkårsvurdering } from './sider/Vilkårsvurdering/Vilkårsvurdering';
import { VilkårsvurderingProvider } from './sider/Vilkårsvurdering/VilkårsvurderingContext';
import { TidslinjeProvider } from '../../../komponenter/Tidslinje/TidslinjeContext';
import { hentSideHref } from '../../../utils/miljø';
import { RefusjonEøsTabellProvider } from './sider/Vedtak/RefusjonEøs/RefusjonEøsTabellContext';

export function BehandlingRouter() {
    const { bruker } = useBrukerContext();
    const { behandling, leggTilBesøktSide } = useBehandlingContext();

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
                    <SøknadProvider åpenBehandling={behandling}>
                        <RegistrerSøknad />
                    </SøknadProvider>
                }
            />
            <Route
                path="/vilkaarsvurdering"
                element={
                    <VilkårsvurderingProvider åpenBehandling={behandling}>
                        <Vilkårsvurdering />
                    </VilkårsvurderingProvider>
                }
            />
            <Route
                path="/tilkjent-ytelse"
                element={
                    <TidslinjeProvider>
                        <Behandlingsresultat åpenBehandling={behandling} />
                    </TidslinjeProvider>
                }
            />
            <Route
                path="/simulering"
                element={
                    <SimuleringProvider åpenBehandling={behandling}>
                        <Simulering åpenBehandling={behandling} />
                    </SimuleringProvider>
                }
            />
            <Route
                path="/vedtak"
                element={
                    <FeilutbetaltValutaTabellProvider>
                        <RefusjonEøsTabellProvider>
                            <SammensattKontrollsakProvider åpenBehandling={behandling}>
                                <Vedtak åpenBehandling={behandling} bruker={bruker} />
                            </SammensattKontrollsakProvider>
                        </RefusjonEøsTabellProvider>
                    </FeilutbetaltValutaTabellProvider>
                }
            />
        </Routes>
    );
}
