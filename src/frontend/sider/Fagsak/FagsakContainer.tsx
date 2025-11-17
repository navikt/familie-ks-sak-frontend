import { Navigate, Route, Routes } from 'react-router';
import styled from 'styled-components';

import { Alert, HStack, Loader } from '@navikt/ds-react';

import BehandlingContainer from './Behandling/BehandlingContainer';
import { BrukerProvider } from './BrukerContext';
import Dokumentutsending from './Dokumentutsending/Dokumentutsending';
import { DokumentutsendingProvider } from './Dokumentutsending/DokumentutsendingContext';
import { FagsakProvider } from './FagsakContext';
import { Fagsaklinje } from './Fagsaklinje/Fagsaklinje';
import JournalpostListe from './journalposter/JournalpostListe';
import { ManuelleBrevmottakerePåFagsakProvider } from './ManuelleBrevmottakerePåFagsakContext';
import Personlinje from './Personlinje/Personlinje';
import { Saksoversikt } from './Saksoversikt/Saksoversikt';
import { useFagsakId } from '../../hooks/useFagsakId';
import { useHentFagsak } from '../../hooks/useHentFagsak';
import { useScrollTilAnker } from '../../hooks/useScrollTilAnker';
import { HentOgSettBehandlingProvider } from './Behandling/context/HentOgSettBehandlingContext';
import { useHentPerson } from '../../hooks/useHentPerson';

const Innhold = styled.div`
    height: calc(100vh - 3rem);
    display: flex;
`;

const Hovedinnhold = styled.div`
    flex: 1;
    overflow: auto;
`;

export const FagsakContainer = () => {
    const fagsakId = useFagsakId();

    const { data: fagsak, isPending: isPendingFagsak, error: fagsakError } = useHentFagsak(fagsakId);

    const {
        data: bruker,
        isPending: isPendingBruker,
        error: brukerError,
    } = useHentPerson({ ident: fagsak?.søkerFødselsnummer });

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

    if (isPendingBruker) {
        return (
            <HStack gap={'4'} margin={'space-16'}>
                <Loader size={'small'} />
                Laster bruker...
            </HStack>
        );
    }

    if (brukerError) {
        return <Alert variant={'error'}>Feil oppstod ved innlasting av bruker: {brukerError.message}</Alert>;
    }

    return (
        <FagsakProvider fagsak={fagsak}>
            <BrukerProvider bruker={bruker}>
                <ManuelleBrevmottakerePåFagsakProvider key={fagsak.id}>
                    <Innhold>
                        <Hovedinnhold id={'fagsak-main'}>
                            <Personlinje bruker={bruker} />
                            <Routes>
                                <Route
                                    path="/saksoversikt"
                                    element={
                                        <>
                                            <Fagsaklinje minimalFagsak={fagsak} />
                                            <Saksoversikt minimalFagsak={fagsak} />
                                        </>
                                    }
                                />

                                <Route
                                    path="/dokumentutsending"
                                    element={
                                        <>
                                            <Fagsaklinje minimalFagsak={fagsak} />
                                            <DokumentutsendingProvider fagsakId={fagsak.id}>
                                                <Dokumentutsending bruker={bruker} />
                                            </DokumentutsendingProvider>
                                        </>
                                    }
                                />

                                <Route
                                    path="/dokumenter"
                                    element={
                                        <>
                                            <Fagsaklinje minimalFagsak={fagsak} />
                                            <JournalpostListe bruker={bruker} />
                                        </>
                                    }
                                />

                                <Route
                                    path="/:behandlingId/*"
                                    element={
                                        <HentOgSettBehandlingProvider fagsak={fagsak}>
                                            <BehandlingContainer bruker={bruker} minimalFagsak={fagsak} />
                                        </HentOgSettBehandlingProvider>
                                    }
                                />
                                <Route path="/" element={<Navigate to={`/fagsak/${fagsak.id}/saksoversikt`} />} />
                            </Routes>
                        </Hovedinnhold>
                    </Innhold>
                </ManuelleBrevmottakerePåFagsakProvider>
            </BrukerProvider>
        </FagsakProvider>
    );
};
