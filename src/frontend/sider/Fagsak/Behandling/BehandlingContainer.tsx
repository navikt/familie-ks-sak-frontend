import React, { useEffect } from 'react';

import { Route, Routes, useLocation } from 'react-router';
import styled from 'styled-components';

import { Alert } from '@navikt/ds-react';
import { ABorderDivider } from '@navikt/ds-tokens/dist/tokens';
import { RessursStatus } from '@navikt/familie-typer';

import { useBehandlingContext } from './context/BehandlingContext';
import Høyremeny from './Høyremeny/Høyremeny';
import Behandlingsresultat from './sider/Behandlingsresultat/Behandlingsresultat';
import RegistrerSøknad from './sider/RegistrerSøknad/RegistrerSøknad';
import { SøknadProvider } from './sider/RegistrerSøknad/SøknadContext';
import type { SideId } from './sider/sider';
import { sider } from './sider/sider';
import Simulering from './sider/Simulering/Simulering';
import { SimuleringProvider } from './sider/Simulering/SimuleringContext';
import { SammensattKontrollsakProvider } from './sider/Vedtak/SammensattKontrollsak/SammensattKontrollsakContext';
import Vedtak from './sider/Vedtak/Vedtak';
import Vilkårsvurdering from './sider/Vilkårsvurdering/Vilkårsvurdering';
import { VilkårsvurderingProvider } from './sider/Vilkårsvurdering/VilkårsvurderingContext';
import { TidslinjeProvider } from '../../../komponenter/Tidslinje/TidslinjeContext';
import type { IMinimalFagsak } from '../../../typer/fagsak';
import type { IPersonInfo } from '../../../typer/person';
import { hentSideHref } from '../../../utils/miljø';
import { Fagsaklinje } from '../Fagsaklinje/Fagsaklinje';
import Venstremeny from './Venstremeny/Venstremeny';

const FlexContainer = styled.div`
    display: flex;
`;

const VenstremenyContainer = styled.div`
    min-width: 1rem;
    border-right: 1px solid ${ABorderDivider};
    overflow: hidden;
`;

const HovedinnholdContainer = styled.div`
    height: calc(100vh - 6rem);
    flex: 1;
    overflow: auto;
`;

const HøyremenyContainer = styled.div`
    border-left: 1px solid ${ABorderDivider};
    overflow-x: hidden;
    overflow-y: scroll;
`;

interface Props {
    bruker: IPersonInfo;
    minimalFagsak: IMinimalFagsak;
}

const BehandlingContainer: React.FunctionComponent<Props> = ({ bruker, minimalFagsak }) => {
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
                <>
                    <Fagsaklinje minimalFagsak={minimalFagsak} />
                    <FlexContainer>
                        <VenstremenyContainer>
                            <Venstremeny />
                        </VenstremenyContainer>
                        <HovedinnholdContainer>
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
                                        <VilkårsvurderingProvider
                                            åpenBehandling={åpenBehandling.data}
                                        >
                                            <Vilkårsvurdering
                                                åpenBehandling={åpenBehandling.data}
                                            />
                                        </VilkårsvurderingProvider>
                                    }
                                />
                                <Route
                                    path="/tilkjent-ytelse"
                                    element={
                                        <TidslinjeProvider>
                                            <Behandlingsresultat
                                                åpenBehandling={åpenBehandling.data}
                                            />
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
                                        <SammensattKontrollsakProvider
                                            åpenBehandling={åpenBehandling.data}
                                        >
                                            <Vedtak
                                                åpenBehandling={åpenBehandling.data}
                                                bruker={bruker}
                                            />
                                        </SammensattKontrollsakProvider>
                                    }
                                />
                            </Routes>
                        </HovedinnholdContainer>
                        <HøyremenyContainer>
                            <Høyremeny bruker={bruker} />
                        </HøyremenyContainer>
                    </FlexContainer>
                </>
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
