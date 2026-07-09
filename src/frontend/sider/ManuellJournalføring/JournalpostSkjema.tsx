import type { OppgavetypeFilter } from '@typer/oppgave';
import { oppgaveTypeFilter } from '@typer/oppgave';
import { useNavigate } from 'react-router';

import { ChevronLeftIcon } from '@navikt/aksel-icons';
import { Box, Button, ErrorSummary, Heading, HStack, LocalAlert, VStack } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import { AvsenderPanel } from './AvsenderPanel';
import { BrukerPanel } from './BrukerPanel';
import { Dokumenter } from './Dokument/Dokumenter';
import Journalpost from './Journalpost';
import { KnyttJournalpostTilBehandling } from './KnyttJournalpostTilBehandling';
import { useManuellJournalføringContext } from './ManuellJournalføringContext';

export const JournalpostSkjema = () => {
    const {
        dataForManuellJournalføring,
        skjema,
        journalfør,
        hentFeilTilOppsummering,
        erLesevisning,
        lukkOppgaveOgKnyttJournalpostTilBehandling,
        kanKnytteJournalpostTilBehandling,
    } = useManuellJournalføringContext();

    const navigate = useNavigate();

    return (
        <Box overflow={'auto'} padding={'space-32'}>
            {dataForManuellJournalføring.status === RessursStatus.SUKSESS && (
                <Heading spacing size="medium" level="2">
                    {
                        oppgaveTypeFilter[
                            dataForManuellJournalføring.data.oppgave.oppgavetype as keyof typeof OppgavetypeFilter
                        ].navn
                    }
                </Heading>
            )}
            <VStack gap={'space-40'}>
                <Journalpost />
                <VStack>
                    <Heading size={'small'} level={'2'} children={'Dokumenter'} />
                    <Dokumenter />
                </VStack>
                <VStack gap={'space-16'}>
                    <Heading size={'small'} level={'2'} children={'Bruker og avsender'} />
                    <BrukerPanel />
                    <AvsenderPanel />
                </VStack>
                <VStack gap={'space-28'}>
                    {kanKnytteJournalpostTilBehandling() && <KnyttJournalpostTilBehandling />}

                    {(skjema.submitRessurs.status === RessursStatus.FEILET ||
                        skjema.submitRessurs.status === RessursStatus.FUNKSJONELL_FEIL ||
                        skjema.submitRessurs.status === RessursStatus.IKKE_TILGANG) && (
                        <LocalAlert status="error">
                            <LocalAlert.Header>
                                <LocalAlert.Title>{skjema.submitRessurs.frontendFeilmelding}</LocalAlert.Title>
                            </LocalAlert.Header>
                        </LocalAlert>
                    )}
                    {skjema.visFeilmeldinger && hentFeilTilOppsummering().length > 0 && (
                        <ErrorSummary heading={'For å gå videre må du rette opp følgende'}>
                            {hentFeilTilOppsummering().map(item => (
                                <ErrorSummary.Item href={`#${item.skjemaelementId}`} key={item.skjemaelementId}>
                                    {item.feilmelding}
                                </ErrorSummary.Item>
                            ))}
                        </ErrorSummary>
                    )}
                </VStack>
            </VStack>
            <HStack marginBlock={'space-16'} justify={'space-between'}>
                <Button
                    size="small"
                    variant={'secondary'}
                    onClick={() => navigate(`/oppgaver`)}
                    disabled={skjema.submitRessurs.status === RessursStatus.HENTER}
                    icon={erLesevisning() && <ChevronLeftIcon />}
                >
                    {erLesevisning() ? 'Tilbake' : 'Avbryt'}
                </Button>
                {!erLesevisning() && (
                    <Button
                        size="small"
                        variant="primary"
                        onClick={journalfør}
                        disabled={skjema.submitRessurs.status === RessursStatus.HENTER}
                    >
                        Journalfør
                    </Button>
                )}

                {erLesevisning() && kanKnytteJournalpostTilBehandling() && (
                    <Button
                        size="small"
                        variant="primary"
                        onClick={lukkOppgaveOgKnyttJournalpostTilBehandling}
                        disabled={skjema.submitRessurs.status === RessursStatus.HENTER}
                    >
                        Ferdigstill oppgave
                    </Button>
                )}
            </HStack>
        </Box>
    );
};
