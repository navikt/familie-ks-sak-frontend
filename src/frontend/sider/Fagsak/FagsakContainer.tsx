import { Navigate, Route, Routes } from 'react-router';

import { Alert, Box, HStack, Loader } from '@navikt/ds-react';

import { BehandlingContainer } from './Behandling/BehandlingContainer';
import { HentOgSettBehandlingProvider } from './Behandling/context/HentOgSettBehandlingContext';
import { BrukerProvider } from './BrukerContext';
import { Dokumentutsending } from './Dokumentutsending/Dokumentutsending';
import { DokumentutsendingProvider } from './Dokumentutsending/DokumentutsendingContext';
import Styles from './FagsakContainer.module.css';
import { FagsakProvider } from './FagsakContext';
import { JournalpostListe } from './journalposter/JournalpostListe';
import { ManuelleBrevmottakerePåFagsakProvider } from './ManuelleBrevmottakerePåFagsakContext';
import { Saksoversikt } from './Saksoversikt/Saksoversikt';
import { useFagsakIdParam } from '../../hooks/useFagsakIdParam';
import { useHentFagsak } from '../../hooks/useHentFagsak';
import { useHentPerson } from '../../hooks/useHentPerson';
import { useScrollTilAnker } from '../../hooks/useScrollTilAnker';
import { Personlinje } from '../../komponenter/Personlinje/Personlinje';
import { Fagsaklinje } from '../../komponenter/Saklinje/Fagsaklinje';

export function FagsakContainer() {
    const fagsakIdParam = useFagsakIdParam();

    const { data: fagsak, isPending: isPendingFagsak, error: fagsakError } = useHentFagsak(fagsakIdParam);

    const {
        data: bruker,
        isPending: isPendingBruker,
        error: brukerError,
    } = useHentPerson({ ident: fagsak?.søkerFødselsnummer });

    useScrollTilAnker();

    if (isPendingFagsak) {
        return (
            <HStack gap={'space-16'} margin={'space-16'}>
                <Loader size={'small'} />
                Laster fagsak...
            </HStack>
        );
    }

    if (fagsakError) {
        return (
            <Box padding={'space-8'}>
                <Alert variant={'error'}>Feil oppstod ved innlasting av fagsak: {fagsakError.message}</Alert>
            </Box>
        );
    }

    if (isPendingBruker) {
        return (
            <HStack gap={'space-16'} margin={'space-16'}>
                <Loader size={'small'} />
                Laster bruker...
            </HStack>
        );
    }

    if (brukerError) {
        return (
            <Box padding={'space-8'}>
                <Alert variant={'error'}>Feil oppstod ved innlasting av bruker: {brukerError.message}</Alert>
            </Box>
        );
    }

    return (
        <Box className={Styles.container}>
            <FagsakProvider fagsak={fagsak}>
                <BrukerProvider bruker={bruker}>
                    <ManuelleBrevmottakerePåFagsakProvider key={fagsak.id}>
                        <Personlinje bruker={bruker} />
                        <Routes>
                            <Route
                                path="/saksoversikt"
                                element={
                                    <>
                                        <Fagsaklinje />
                                        <Saksoversikt />
                                    </>
                                }
                            />
                            <Route
                                path="/dokumentutsending"
                                element={
                                    <>
                                        <Fagsaklinje />
                                        <DokumentutsendingProvider>
                                            <Dokumentutsending />
                                        </DokumentutsendingProvider>
                                    </>
                                }
                            />
                            <Route
                                path="/dokumenter"
                                element={
                                    <>
                                        <Fagsaklinje />
                                        <JournalpostListe />
                                    </>
                                }
                            />
                            <Route
                                path="/:behandlingId/*"
                                element={
                                    <HentOgSettBehandlingProvider>
                                        <BehandlingContainer />
                                    </HentOgSettBehandlingProvider>
                                }
                            />
                            <Route path="/" element={<Navigate to={`/fagsak/${fagsak.id}/saksoversikt`} />} />
                        </Routes>
                    </ManuelleBrevmottakerePåFagsakProvider>
                </BrukerProvider>
            </FagsakProvider>
        </Box>
    );
}
