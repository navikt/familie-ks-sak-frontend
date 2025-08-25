import React, { useEffect } from 'react';

import { Navigate, Route, Routes } from 'react-router';
import styled from 'styled-components';

import { Alert } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import BehandlingContainer from './Behandling/BehandlingContainer';
import Dokumentutsending from './Dokumentutsending/Dokumentutsending';
import { DokumentutsendingProvider } from './Dokumentutsending/DokumentutsendingContext';
import { Fagsaklinje } from './Fagsaklinje/Fagsaklinje';
import JournalpostListe from './journalposter/JournalpostListe';
import Personlinje from './Personlinje/Personlinje';
import { Saksoversikt } from './Saksoversikt/Saksoversikt';
import { useFagsakContext } from '../../context/fagsak/FagsakContext';
import useSakOgBehandlingParams from '../../hooks/useSakOgBehandlingParams';
import { useScrollTilAnker } from '../../hooks/useScrollTilAnker';

const Innhold = styled.div`
    height: calc(100vh - 6rem);
    display: flex;
`;

const Hovedinnhold = styled.div`
    flex: 1;
    overflow: auto;
`;

const FagsakContainer: React.FunctionComponent = () => {
    const { fagsakId } = useSakOgBehandlingParams();
    useScrollTilAnker();

    const { bruker, minimalFagsakRessurs, hentMinimalFagsak } = useFagsakContext();

    useEffect(() => {
        if (fagsakId !== undefined) {
            if (minimalFagsakRessurs.status !== RessursStatus.SUKSESS) {
                hentMinimalFagsak(fagsakId);
            } else if (
                minimalFagsakRessurs.status === RessursStatus.SUKSESS &&
                minimalFagsakRessurs.data.id !== parseInt(fagsakId, 10)
            ) {
                hentMinimalFagsak(fagsakId);
            }
        }
    }, [fagsakId]);

    switch (minimalFagsakRessurs.status) {
        case RessursStatus.SUKSESS:
            switch (bruker.status) {
                case RessursStatus.SUKSESS:
                    return (
                        <Innhold>
                            <Hovedinnhold id={'fagsak-main'}>
                                <Personlinje bruker={bruker.data} />
                                <Routes>
                                    <Route
                                        path="/saksoversikt"
                                        element={
                                            <>
                                                <Fagsaklinje
                                                    minimalFagsak={minimalFagsakRessurs.data}
                                                />
                                                <Saksoversikt
                                                    minimalFagsak={minimalFagsakRessurs.data}
                                                />
                                            </>
                                        }
                                    />

                                    <Route
                                        path="/dokumentutsending"
                                        element={
                                            <>
                                                <Fagsaklinje
                                                    minimalFagsak={minimalFagsakRessurs.data}
                                                />
                                                <DokumentutsendingProvider
                                                    fagsakId={minimalFagsakRessurs.data.id}
                                                >
                                                    <Dokumentutsending bruker={bruker.data} />
                                                </DokumentutsendingProvider>
                                            </>
                                        }
                                    />

                                    <Route
                                        path="/dokumenter"
                                        element={
                                            <>
                                                <Fagsaklinje
                                                    minimalFagsak={minimalFagsakRessurs.data}
                                                />
                                                <JournalpostListe bruker={bruker.data} />
                                            </>
                                        }
                                    />

                                    <Route
                                        path="/:behandlingId/*"
                                        element={
                                            <BehandlingContainer
                                                bruker={bruker.data}
                                                minimalFagsak={minimalFagsakRessurs.data}
                                            />
                                        }
                                    />
                                    <Route
                                        path="/"
                                        element={
                                            <Navigate to={`/fagsak/${fagsakId}/saksoversikt`} />
                                        }
                                    />
                                </Routes>
                            </Hovedinnhold>
                        </Innhold>
                    );
                case RessursStatus.FEILET:
                case RessursStatus.FUNKSJONELL_FEIL:
                case RessursStatus.IKKE_TILGANG:
                    return <Alert children={bruker.frontendFeilmelding} variant="error" />;
                default:
                    return <div />;
            }
        case RessursStatus.IKKE_TILGANG:
            return (
                <Alert
                    children={minimalFagsakRessurs.frontendFeilmelding}
                    variant="error"
                    contentMaxWidth={false}
                />
            );
        case RessursStatus.FEILET:
        case RessursStatus.FUNKSJONELL_FEIL:
            return <Alert children={minimalFagsakRessurs.frontendFeilmelding} variant="error" />;
        default:
            return <div />;
    }
};

export default FagsakContainer;
