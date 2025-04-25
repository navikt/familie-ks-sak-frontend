import React, { useEffect } from 'react';

import { Route, Routes, useLocation } from 'react-router';

import { Alert } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import Behandlingsresultat from './sider/Behandlingsresultat/Behandlingsresultat';
import RegistrerSøknad from './sider/RegistrerSøknad/RegistrerSøknad';
import { SøknadProvider } from './sider/RegistrerSøknad/SøknadContext';
import type { SideId } from './sider/sider';
import { sider } from './sider/sider';
import Simulering from './sider/Simulering/Simulering';
import { SimuleringProvider } from './sider/Simulering/SimuleringContext';
import OppsummeringVedtak from './sider/Vedtak/OppsummeringVedtak';
import { SammensattKontrollsakProvider } from './sider/Vedtak/SammensattKontrollsak/useSammensattKontrollsakContext';
import Vilkårsvurdering from './sider/Vilkårsvurdering/Vilkårsvurdering';
import { VilkårsvurderingProvider } from './sider/Vilkårsvurdering/VilkårsvurderingContext';
import { TidslinjeProvider } from '../../../context/TidslinjeContext';
import type { IPersonInfo } from '../../../typer/person';
import { hentSideHref } from '../../../utils/miljø';
import { useBehandlingContext } from './sider/Vedtak/VedtakBegrunnelserTabell/Context/BehandlingContext';

interface Props {
    bruker: IPersonInfo;
}

const BehandlingContainer: React.FunctionComponent<Props> = ({ bruker }) => {
    const location = useLocation();
    const { åpenBehandling, leggTilBesøktSide } = useBehandlingContext();

    const sidevisning = hentSideHref(location.pathname);
    useEffect(() => {
        if (sidevisning) {
            leggTilBesøktSide(
                Object.entries(sider).find(([_, side]) => side.href === sidevisning)?.[0] as SideId
            );
        }
    }, [sidevisning]);

    switch (åpenBehandling.status) {
        case RessursStatus.SUKSESS:
            return (
                <Routes>
                    <Route
                        path="/registrer-soknad"
                        element={
                            <SøknadProvider åpenBehandling={åpenBehandling.data}>
                                <RegistrerSøknad />
                            </SøknadProvider>
                        }
                    />
                    <Route
                        path="/vilkaarsvurdering"
                        element={
                            <VilkårsvurderingProvider åpenBehandling={åpenBehandling.data}>
                                <Vilkårsvurdering åpenBehandling={åpenBehandling.data} />
                            </VilkårsvurderingProvider>
                        }
                    />
                    <Route
                        path="/tilkjent-ytelse"
                        element={
                            <TidslinjeProvider>
                                <Behandlingsresultat åpenBehandling={åpenBehandling.data} />
                            </TidslinjeProvider>
                        }
                    />
                    <Route
                        path="/simulering"
                        element={
                            <SimuleringProvider åpenBehandling={åpenBehandling.data}>
                                <Simulering åpenBehandling={åpenBehandling.data} />
                            </SimuleringProvider>
                        }
                    />
                    <Route
                        path="/vedtak"
                        element={
                            <SammensattKontrollsakProvider behandling={åpenBehandling.data}>
                                <OppsummeringVedtak
                                    åpenBehandling={åpenBehandling.data}
                                    bruker={bruker}
                                />
                            </SammensattKontrollsakProvider>
                        }
                    />
                </Routes>
            );
        case RessursStatus.IKKE_TILGANG:
            return (
                <Alert
                    variant="warning"
                    children={`Du har ikke tilgang til å se denne behandlingen.`}
                />
            );
        case RessursStatus.FEILET:
        case RessursStatus.FUNKSJONELL_FEIL:
            return <Alert children={åpenBehandling.frontendFeilmelding} variant="error" />;
        default:
            return <div />;
    }
};

export default BehandlingContainer;
