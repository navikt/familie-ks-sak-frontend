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
import type { IMinimalFagsak } from '../../typer/fagsak';

const Innhold = styled.div`
    height: calc(100vh - 3rem);
    display: flex;
`;

const Hovedinnhold = styled.div`
    flex: 1;
    overflow: auto;
`;

const FagsakContainerInnhold = ({ minimalFagsak }: { minimalFagsak: IMinimalFagsak }) => {
    const { bruker } = useFagsakContext();

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
                                        <Fagsaklinje minimalFagsak={minimalFagsak} />
                                        <Saksoversikt minimalFagsak={minimalFagsak} />
                                    </>
                                }
                            />

                            <Route
                                path="/dokumentutsending"
                                element={
                                    <>
                                        <Fagsaklinje minimalFagsak={minimalFagsak} />
                                        <DokumentutsendingProvider fagsakId={minimalFagsak.id}>
                                            <Dokumentutsending bruker={bruker.data} />
                                        </DokumentutsendingProvider>
                                    </>
                                }
                            />

                            <Route
                                path="/dokumenter"
                                element={
                                    <>
                                        <Fagsaklinje minimalFagsak={minimalFagsak} />
                                        <JournalpostListe bruker={bruker.data} />
                                    </>
                                }
                            />

                            <Route
                                path="/:behandlingId/*"
                                element={
                                    <BehandlingContainer
                                        bruker={bruker.data}
                                        minimalFagsak={minimalFagsak}
                                    />
                                }
                            />
                            <Route
                                path="/"
                                element={
                                    <Navigate to={`/fagsak/${minimalFagsak.id}/saksoversikt`} />
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
};

const FagsakContainer: React.FunctionComponent = () => {
    const { fagsakId } = useSakOgBehandlingParams();
    const { minimalFagsakRessurs, hentMinimalFagsak } = useFagsakContext();

    useScrollTilAnker();

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
            return <FagsakContainerInnhold minimalFagsak={minimalFagsakRessurs.data} />;
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
