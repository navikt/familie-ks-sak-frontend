import React from 'react';

import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router';
import styled from 'styled-components';

import { useAppContext } from './context/AppContext';
import { FagsakProvider } from './context/fagsak/FagsakContext';
import { HeaderMedSøk } from './komponenter/HeaderMedSøk/HeaderMedSøk';
import AppInfoModal from './komponenter/Modal/AppInfoModal';
import { FeilmeldingModal } from './komponenter/Modal/FeilmeldingModal';
import UgyldigSesjon from './komponenter/Modal/SesjonUtløpt';
import SystemetLaster from './komponenter/SystemetLaster/SystemetLaster';
import { TidslinjeProvider } from './komponenter/Tidslinje/TidslinjeContext';
import Toasts from './komponenter/Toast/Toasts';
import Barnehagelister from './sider/Barnehagelister/Barnehagelister';
import { BehandlingProvider } from './sider/Fagsak/Behandling/context/BehandlingContext';
import FagsakContainer from './sider/Fagsak/FagsakContainer';
import Internstatistikk from './sider/Internstatistikk/Internstatistikk';
import ManuellJournalføring from './sider/ManuellJournalføring/ManuellJournalføring';
import { Oppgavebenk } from './sider/Oppgavebenk/Oppgavebenk';
import TidslinjeVisualisering from './sider/Tidslinjer/TidslinjeVisualisering';

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
        useAppContext();

    return (
        <Router>
            {appInfoModal.visModal && <AppInfoModal modal={appInfoModal} />}
            {autentisert ? (
                erTogglesHentet && (
                    <>
                        {systemetLaster() && <SystemetLaster />}
                        <Toasts />

                        <Main $systemetLaster={systemetLaster()}>
                            <FeilmeldingModal />
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
                                            element={<ManuellJournalføring />}
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
                                            element={<Barnehagelister />}
                                        />
                                        <Route path="/oppgaver" element={<Oppgavebenk />} />
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
