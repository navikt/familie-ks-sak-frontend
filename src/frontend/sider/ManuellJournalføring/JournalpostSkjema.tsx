import { BrukerOgAvsender } from '@sider/ManuellJournalføring/BrukerOgAvsender';
import { Journalpost } from '@sider/ManuellJournalføring/Journalpost';
import { useNavigate } from 'react-router';

import { ChevronLeftIcon } from '@navikt/aksel-icons';
import { Box, Button, ErrorSummary, HStack, LocalAlert } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import { Dokumenter } from './Dokument/Dokumenter';
import { KnyttJournalpostTilBehandling } from './KnyttJournalpostTilBehandling';
import { useManuellJournalføringContext } from './ManuellJournalføringContext';

export const JournalpostSkjema = () => {
    const {
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
            <Journalpost />
            <Dokumenter />
            <BrukerOgAvsender />
            {kanKnytteJournalpostTilBehandling() && <KnyttJournalpostTilBehandling />}

            <br />
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

            <HStack marginBlock={'space-16 space-0'} justify={'space-between'}>
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
