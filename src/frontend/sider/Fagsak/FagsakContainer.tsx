import React from 'react';

import { Navigate, Route, Routes } from 'react-router';
import styled from 'styled-components';

import { Alert, HStack, Loader } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import BehandlingContainer from './Behandling/BehandlingContainer';
import Dokumentutsending from './Dokumentutsending/Dokumentutsending';
import { DokumentutsendingProvider } from './Dokumentutsending/DokumentutsendingContext';
import { Fagsaklinje } from './Fagsaklinje/Fagsaklinje';
import JournalpostListe from './journalposter/JournalpostListe';
import Personlinje from './Personlinje/Personlinje';
import { Saksoversikt } from './Saksoversikt/Saksoversikt';
import { FagsakProvider, useFagsakContext } from '../../context/fagsak/FagsakContext';
import { useFagsakId } from '../../hooks/useFagsakId';
import { useHentFagsak } from '../../hooks/useHentFagsak';
import { useScrollTilAnker } from '../../hooks/useScrollTilAnker';
import type { IMinimalFagsak } from '../../typer/fagsak';

const Innhold = styled.div`
    height: calc(100vh - 6rem);
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
    const fagsakId = useFagsakId();

    useScrollTilAnker();

    const {
        data: minimalFagsak,
        isPending: hentMinimalFagsakLaster,
        error: hentMinimalFagsakError,
    } = useHentFagsak(fagsakId);

    if (hentMinimalFagsakLaster) {
        return (
            <HStack gap={'4'} margin={'space-16'}>
                <Loader size={'small'} />
                Laster fagsak...
            </HStack>
        );
    }

    if (hentMinimalFagsakError !== null) {
        return (
            <Alert variant={'error'}>
                Feil oppstod ved innlasting av fagsak: {hentMinimalFagsakError.message}
            </Alert>
        );
    }

    return (
        <FagsakProvider fagsak={minimalFagsak}>
            <FagsakContainerInnhold minimalFagsak={minimalFagsak} />
        </FagsakProvider>
    );
};

export default FagsakContainer;
