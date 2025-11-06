import { Navigate, Route, Routes } from 'react-router';
import styled from 'styled-components';

import { Alert, HStack, Loader } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import BehandlingContainer from './Behandling/BehandlingContainer';
import Dokumentutsending from './Dokumentutsending/Dokumentutsending';
import { DokumentutsendingProvider } from './Dokumentutsending/DokumentutsendingContext';
import { FagsakProvider, useFagsakContext } from './FagsakContext';
import { Fagsaklinje } from './Fagsaklinje/Fagsaklinje';
import JournalpostListe from './journalposter/JournalpostListe';
import { ManuelleBrevmottakerePåFagsakProvider } from './ManuelleBrevmottakerePåFagsakContext';
import Personlinje from './Personlinje/Personlinje';
import { Saksoversikt } from './Saksoversikt/Saksoversikt';
import { useFagsakId } from '../../hooks/useFagsakId';
import { useHentFagsak } from '../../hooks/useHentFagsak';
import { useScrollTilAnker } from '../../hooks/useScrollTilAnker';
import type { IMinimalFagsak } from '../../typer/fagsak';
import { HentOgSettBehandlingProvider } from './Behandling/context/HentOgSettBehandlingContext';

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
                <ManuelleBrevmottakerePåFagsakProvider key={minimalFagsak.id}>
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
                                        <HentOgSettBehandlingProvider fagsak={minimalFagsak}>
                                            <BehandlingContainer bruker={bruker.data} minimalFagsak={minimalFagsak} />
                                        </HentOgSettBehandlingProvider>
                                    }
                                />
                                <Route
                                    path="/"
                                    element={<Navigate to={`/fagsak/${minimalFagsak.id}/saksoversikt`} />}
                                />
                            </Routes>
                        </Hovedinnhold>
                    </Innhold>
                </ManuelleBrevmottakerePåFagsakProvider>
            );
        case RessursStatus.FEILET:
        case RessursStatus.FUNKSJONELL_FEIL:
        case RessursStatus.IKKE_TILGANG:
            return <Alert children={bruker.frontendFeilmelding} variant="error" />;
        default:
            return <div />;
    }
};

export function FagsakContainer() {
    const fagsakId = useFagsakId();

    const { data: fagsak, isPending: isPendingFagsak, error: fagsakError } = useHentFagsak(fagsakId);

    useScrollTilAnker();

    if (isPendingFagsak) {
        return (
            <HStack gap={'4'} margin={'space-16'}>
                <Loader size={'small'} />
                Laster fagsak...
            </HStack>
        );
    }

    if (fagsakError) {
        return <Alert variant={'error'}>Feil oppstod ved innlasting av fagsak: {fagsakError.message}</Alert>;
    }

    return (
        <FagsakProvider fagsak={fagsak}>
            <FagsakContainerInnhold minimalFagsak={fagsak} />
        </FagsakProvider>
    );
}
