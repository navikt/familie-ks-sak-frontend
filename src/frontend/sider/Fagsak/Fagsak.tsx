import { useFagsakIdParam } from '@hooks/useFagsakIdParam';
import { useHentFagsak } from '@hooks/useHentFagsak';
import { useHentPerson } from '@hooks/useHentPerson';
import { useScrollTilAnker } from '@hooks/useScrollTilAnker';
import { NotFound } from '@komponenter/Error/NotFound';
import { Personlinje } from '@komponenter/Personlinje/Personlinje';
import { Box, GlobalAlert, HStack, Loader } from '@navikt/ds-react';
import { Outlet } from 'react-router';
import { BrevmottakereFagsakProvider } from './BrevmottakereFagsakContext';
import { BrukerProvider } from './BrukerContext';
import Styles from './Fagsak.module.css';
import { FagsakProvider } from './FagsakContext';

export function Fagsak() {
    const fagsakIdParam = useFagsakIdParam();

    const { data: fagsak, isPending: isPendingFagsak, error: fagsakError } = useHentFagsak(fagsakIdParam);

    const {
        data: bruker,
        isPending: isPendingBruker,
        error: brukerError,
    } = useHentPerson({ ident: fagsak?.søkerFødselsnummer });

    useScrollTilAnker();

    if (!fagsakIdParam) {
        return <NotFound />;
    }

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
                <GlobalAlert status={'error'}>
                    <GlobalAlert.Header>
                        <GlobalAlert.Title>Feil oppstod ved innlasting av fagsak</GlobalAlert.Title>
                    </GlobalAlert.Header>
                    <GlobalAlert.Content>{fagsakError.message}</GlobalAlert.Content>
                </GlobalAlert>
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
                <GlobalAlert status={'error'}>
                    <GlobalAlert.Header>
                        <GlobalAlert.Title>Feil oppstod ved innlasting av bruker</GlobalAlert.Title>
                    </GlobalAlert.Header>
                    <GlobalAlert.Content>{brukerError.message}</GlobalAlert.Content>
                </GlobalAlert>
            </Box>
        );
    }

    return (
        <Box className={Styles.container}>
            <FagsakProvider key={fagsak.id} fagsak={fagsak}>
                <BrukerProvider key={bruker.personIdent} bruker={bruker}>
                    <BrevmottakereFagsakProvider>
                        <Personlinje bruker={bruker} />
                        <Outlet />
                    </BrevmottakereFagsakProvider>
                </BrukerProvider>
            </FagsakProvider>
        </Box>
    );
}
