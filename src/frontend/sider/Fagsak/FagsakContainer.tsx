import React, { useEffect } from 'react';

import { Navigate, Route, Routes, useLocation } from 'react-router';
import styled from 'styled-components';

import { Alert } from '@navikt/ds-react';
import { ABorderDivider } from '@navikt/ds-tokens/dist/tokens';
import { RessursStatus } from '@navikt/familie-typer';

import BehandlingContainer from './BehandlingContainer';
import Dokumentutsending from './Dokumentutsending/Dokumentutsending';
import Høyremeny from './Høyremeny/Høyremeny';
import JournalpostListe from './journalposter/JournalpostListe';
import Personlinje from './Personlinje/Personlinje';
import Saksoversikt from './Saksoversikt/Saksoversikt';
import { DokumentutsendingProvider } from '../../context/DokumentutsendingContext';
import { useFagsakContext } from '../../context/fagsak/FagsakContext';
import useSakOgBehandlingParams from '../../hooks/useSakOgBehandlingParams';
import { useScrollTilAnker } from '../../hooks/useScrollTilAnker';
import Venstremeny from '../../komponenter/Venstremeny/Venstremeny';

const Innhold = styled.div`
    height: calc(100vh - 6rem);
    display: flex;
`;

const Hovedinnhold = styled.div`
    flex: 1;
    overflow: auto;
`;

const VenstremenyContainer = styled.div`
    min-width: 1rem;
    border-right: 1px solid ${ABorderDivider};
    overflow: hidden;
`;

const HøyremenyContainer = styled.div`
    border-left: 1px solid ${ABorderDivider};
    overflow-x: hidden;
    overflow-y: scroll;
`;
const FagsakContainer: React.FunctionComponent = () => {
    const { fagsakId } = useSakOgBehandlingParams();
    useScrollTilAnker();

    const location = useLocation();
    const erPåSaksoversikt = location.pathname.includes('saksoversikt');
    const erPåDokumentliste = location.pathname.includes('dokumenter');
    const erPåDokumentutsending = location.pathname.includes('dokumentutsending');

    const skalHaVenstremeny = !erPåSaksoversikt && !erPåDokumentliste && !erPåDokumentutsending;

    const skalHaHøyremeny = !erPåSaksoversikt && !erPåDokumentutsending;

    const { bruker, minimalFagsak, hentMinimalFagsak } = useFagsakContext();

    useEffect(() => {
        if (fagsakId !== undefined) {
            if (minimalFagsak.status !== RessursStatus.SUKSESS) {
                hentMinimalFagsak(fagsakId);
            } else if (
                minimalFagsak.status === RessursStatus.SUKSESS &&
                minimalFagsak.data.id !== parseInt(fagsakId, 10)
            ) {
                hentMinimalFagsak(fagsakId);
            }
        }
    }, [fagsakId]);

    switch (minimalFagsak.status) {
        case RessursStatus.SUKSESS:
            switch (bruker.status) {
                case RessursStatus.SUKSESS:
                    return (
                        <>
                            <Personlinje bruker={bruker.data} minimalFagsak={minimalFagsak.data} />

                            <Innhold>
                                {skalHaVenstremeny && (
                                    <VenstremenyContainer>
                                        <Venstremeny />
                                    </VenstremenyContainer>
                                )}
                                <Hovedinnhold id={'fagsak-main'}>
                                    <Routes>
                                        <Route
                                            path="/saksoversikt"
                                            element={
                                                <Saksoversikt minimalFagsak={minimalFagsak.data} />
                                            }
                                        />

                                        <Route
                                            path="/dokumentutsending"
                                            element={
                                                <DokumentutsendingProvider
                                                    fagsakId={minimalFagsak.data.id}
                                                >
                                                    <Dokumentutsending bruker={bruker.data} />
                                                </DokumentutsendingProvider>
                                            }
                                        />

                                        <Route
                                            path="/dokumenter"
                                            element={<JournalpostListe bruker={bruker.data} />}
                                        />

                                        <Route
                                            path="/:behandlingId/*"
                                            element={<BehandlingContainer bruker={bruker.data} />}
                                        />
                                        <Route
                                            path="/"
                                            element={
                                                <Navigate to={`/fagsak/${fagsakId}/saksoversikt`} />
                                            }
                                        />
                                    </Routes>
                                </Hovedinnhold>
                                {skalHaHøyremeny && (
                                    <HøyremenyContainer>
                                        <Høyremeny bruker={bruker.data} />
                                    </HøyremenyContainer>
                                )}
                            </Innhold>
                        </>
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
                    children={minimalFagsak.frontendFeilmelding}
                    variant="error"
                    contentMaxWidth={false}
                />
            );
        case RessursStatus.FEILET:
        case RessursStatus.FUNKSJONELL_FEIL:
            return <Alert children={minimalFagsak.frontendFeilmelding} variant="error" />;
        default:
            return <div />;
    }
};

export default FagsakContainer;
