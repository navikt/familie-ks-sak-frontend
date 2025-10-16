import { useEffect } from 'react';

import { Route, Routes, useLocation } from 'react-router';

import { useBehandlingContext } from './context/BehandlingContext';
import Behandlingsresultat from './sider/Behandlingsresultat/Behandlingsresultat';
import RegistrerSøknad from './sider/RegistrerSøknad/RegistrerSøknad';
import { SøknadProvider } from './sider/RegistrerSøknad/SøknadContext';
import { type SideId, sider } from './sider/sider';
import Simulering from './sider/Simulering/Simulering';
import { SimuleringProvider } from './sider/Simulering/SimuleringContext';
import { SammensattKontrollsakProvider } from './sider/Vedtak/SammensattKontrollsak/SammensattKontrollsakContext';
import Vedtak from './sider/Vedtak/Vedtak';
import Vilkårsvurdering from './sider/Vilkårsvurdering/Vilkårsvurdering';
import { VilkårsvurderingProvider } from './sider/Vilkårsvurdering/VilkårsvurderingContext';
import { TidslinjeProvider } from '../../../komponenter/Tidslinje/TidslinjeContext';
import type { IBehandling } from '../../../typer/behandling';
import type { IPersonInfo } from '../../../typer/person';
import { hentSideHref } from '../../../utils/miljø';

interface Props {
    bruker: IPersonInfo;
    åpenBehandling: IBehandling;
}

export const BehandlingRouter = ({ bruker, åpenBehandling }: Props) => {
    const location = useLocation();
    const { leggTilBesøktSide } = useBehandlingContext();

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
                    <SøknadProvider åpenBehandling={åpenBehandling}>
                        <RegistrerSøknad />
                    </SøknadProvider>
                }
            />
            <Route
                path="/vilkaarsvurdering"
                element={
                    <VilkårsvurderingProvider åpenBehandling={åpenBehandling}>
                        <Vilkårsvurdering åpenBehandling={åpenBehandling} />
                    </VilkårsvurderingProvider>
                }
            />
            <Route
                path="/tilkjent-ytelse"
                element={
                    <TidslinjeProvider>
                        <Behandlingsresultat åpenBehandling={åpenBehandling} />
                    </TidslinjeProvider>
                }
            />
            <Route
                path="/simulering"
                element={
                    <SimuleringProvider åpenBehandling={åpenBehandling}>
                        <Simulering åpenBehandling={åpenBehandling} />
                    </SimuleringProvider>
                }
            />
            <Route
                path="/vedtak"
                element={
                    <SammensattKontrollsakProvider åpenBehandling={åpenBehandling}>
                        <Vedtak åpenBehandling={åpenBehandling} bruker={bruker} />
                    </SammensattKontrollsakProvider>
                }
            />
        </Routes>
    );
};
