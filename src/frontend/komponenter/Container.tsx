import React from 'react';

import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router';
import styled from 'styled-components';

import BarnehagebarnTabComp from './Barnehagebarn/BarnehagebarnTabComp';
import FagsakContainer from './Fagsak/FagsakContainer';
import { HeaderMedSøk } from './Felleskomponenter/HeaderMedSøk/HeaderMedSøk';
import AppInfoModal from './Felleskomponenter/Modal/AppInfoModal';
import UgyldigSesjon from './Felleskomponenter/Modal/SesjonUtløpt';
import SystemetLaster from './Felleskomponenter/SystemetLaster/SystemetLaster';
import TidslinjeVisualisering from './Felleskomponenter/TidslinjeVisualisering/TidslinjeVisualisering';
import Toasts from './Felleskomponenter/Toast/Toasts';
import Internstatistikk from './Internstatistikk';
import ManuellJournalfør from './ManuellJournalfør/ManuellJournalfør';
import { useApp } from '../context/AppContext';
import { BehandlingProvider } from '../context/behandlingContext/BehandlingContext';
import { FagsakProvider } from '../context/fagsak/FagsakContext';
import { Oppgaver } from '../context/OppgaverContext';
import { TidslinjeProvider } from '../context/TidslinjeContext';

const Main = styled.main<{ $systemetLaster: boolean }>`
    position: fixed;
    width: 100%;
    height: 100%;
    ${props => {
        if (props.$systemetLaster)
            return `
                filter: blur(12px);
                -webkit-filter: blur(12px);
        `;
    }};
`;

const Container: React.FC = () => {
    const { autentisert, systemetLaster, innloggetSaksbehandler, appInfoModal, erTogglesHentet } =
        useApp();

    return (
        <Router>
            {appInfoModal.visModal && <AppInfoModal modal={appInfoModal} />}
            {autentisert ? (
                erTogglesHentet && (
                    <>
                        {systemetLaster() && <SystemetLaster />}
                        <Toasts />

                        <Main $systemetLaster={systemetLaster()}>
                            <HeaderMedSøk
                                brukerNavn={innloggetSaksbehandler?.displayName}
                                brukerEnhet={innloggetSaksbehandler?.enhet}
                            />
                            <FagsakProvider>
                                <BehandlingProvider>
                                    <Routes>
                                        <Route
                                            path="/fagsak/:fagsakId/*"
                                            element={<FagsakContainer />}
                                        />
                                        <Route
                                            path="/oppgaver/journalfor/:oppgaveId"
                                            element={<ManuellJournalfør />}
                                        />
                                        <Route
                                            path="/tidslinjer/:behandlingId"
                                            element={
                                                <TidslinjeProvider>
                                                    <TidslinjeVisualisering />
                                                </TidslinjeProvider>
                                            }
                                        />
                                        <Route
                                            path="/internstatistikk"
                                            element={<Internstatistikk />}
                                        />
                                        <Route
                                            path="/barnehagelister"
                                            element={<BarnehagebarnTabComp />}
                                        />
                                        <Route path="/oppgaver" element={<Oppgaver />} />
                                        <Route path="/" element={<Navigate to="/oppgaver" />} />
                                    </Routes>
                                </BehandlingProvider>
                            </FagsakProvider>
                        </Main>
                    </>
                )
            ) : (
                <UgyldigSesjon />
            )}
        </Router>
    );
};

export default Container;
