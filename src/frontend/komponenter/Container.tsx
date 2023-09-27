import React from 'react';

import classNames from 'classnames';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';

import FagsakContainer from './Fagsak/FagsakContainer';
import { HeaderMedSøk } from './Felleskomponenter/HeaderMedSøk/HeaderMedSøk';
import UgyldigSesjon from './Felleskomponenter/Modal/SesjonUtløpt';
import UIModalWrapper from './Felleskomponenter/Modal/UIModalWrapper';
import SystemetLaster from './Felleskomponenter/SystemetLaster/SystemetLaster';
import TidslinjeVisualisering from './Felleskomponenter/TidslinjeVisualisering/TidslinjeVisualisering';
import Toasts from './Felleskomponenter/Toast/Toasts';
import Internstatistikk from './Internstatistikk';
import ManuellJournalfør from './ManuellJournalfør/ManuellJournalfør';
import { useApp } from '../context/AppContext';
import { BarnehagebarnComp } from '../context/BarnehagebarnContext';
import { BehandlingProvider } from '../context/behandlingContext/BehandlingContext';
import { FagsakProvider } from '../context/fagsak/FagsakContext';
import { Oppgaver } from '../context/OppgaverContext';
import { TidslinjeProvider } from '../context/TidslinjeContext';

const Container: React.FC = () => {
    const { autentisert, systemetLaster, innloggetSaksbehandler } = useApp();

    return (
        <Router>
            <UIModalWrapper />
            {autentisert ? (
                <>
                    {systemetLaster() && <SystemetLaster />}
                    <Toasts />

                    <main className={classNames('container', systemetLaster() && 'blur')}>
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
                                    <Route path="/barnehagebarn" element={<BarnehagebarnComp />} />
                                    <Route path="/oppgaver" element={<Oppgaver />} />
                                    <Route path="/" element={<Navigate to="/oppgaver" />} />
                                </Routes>
                            </BehandlingProvider>
                        </FagsakProvider>
                    </main>
                </>
            ) : (
                <UgyldigSesjon />
            )}
        </Router>
    );
};

export default Container;
