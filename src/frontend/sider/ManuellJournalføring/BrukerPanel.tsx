import { useEffect, useState } from 'react';

import { useHentFagsakPaaPersonError } from '@hooks/useHentFagsakPaaPersonError';
import { KontoSirkel } from '@ikoner/KontoSirkel';
import { formaterIdent } from '@utils/formatter';
import { identValidator } from '@utils/validators';

import { Box, Button, ExpansionCard, HStack, LocalAlert, TextField, VStack } from '@navikt/ds-react';
import { useFelt, Valideringsstatus } from '@navikt/familie-skjema';

import styles from './BrukerPanel.module.css';
import { DeltagerInfo } from './DeltagerInfo';
import { useManuellJournalføringContext } from './ManuellJournalføringContext';

export const BrukerPanel = () => {
    const { skjema, endreBruker, erLesevisning } = useManuellJournalføringContext();
    const [åpen, settÅpen] = useState(false);
    const [feilMelding, settFeilMelding] = useState<string | undefined>('');
    const [spinner, settSpinner] = useState(false);
    const nyIdent = useFelt({
        verdi: '',
        valideringsfunksjon: identValidator,
    });

    const hentFagsakPaaPersonError = useHentFagsakPaaPersonError(nyIdent.verdi);

    useEffect(() => {
        settFeilMelding('');
    }, [nyIdent.verdi]);

    useEffect(() => {
        if (skjema.visFeilmeldinger && skjema.felter.bruker.valideringsstatus === Valideringsstatus.FEIL) {
            settÅpen(true);
        }
    }, [skjema.visFeilmeldinger, skjema.felter.bruker.valideringsstatus]);

    return (
        <ExpansionCard
            open={åpen}
            onToggle={() => {
                settÅpen(!åpen);
            }}
            aria-label={skjema.felter.bruker.verdi?.navn || 'Ukjent bruker'}
            size="small"
        >
            <ExpansionCard.Header>
                <DeltagerInfo
                    ikon={<KontoSirkel filled={åpen} width={48} height={48} />}
                    navn={skjema.felter.bruker.verdi?.navn || 'Ukjent bruker'}
                    undertittel={'Søker/Bruker'}
                    ident={formaterIdent(skjema.felter.bruker.verdi?.personIdent ?? '')}
                />
            </ExpansionCard.Header>
            <ExpansionCard.Content className={styles.innerContent}>
                {!erLesevisning() && (
                    <VStack>
                        <HStack marginBlock={'space-24'} wrap={false} gap={'space-16'}>
                            <TextField
                                {...nyIdent.hentNavInputProps(!!feilMelding)}
                                error={nyIdent.hentNavInputProps(!!feilMelding).feil || feilMelding}
                                label={'Endre bruker'}
                                description={'Skriv inn brukers/søkers fødselsnummer eller D-nummer'}
                                size="small"
                            />
                            <Box
                                marginBlock={
                                    nyIdent.hentNavInputProps(!!feilMelding).feil || feilMelding
                                        ? 'auto space-28'
                                        : 'auto space-0'
                                }
                                width={'10rem'}
                            >
                                <Button
                                    onClick={() => {
                                        if (nyIdent.valideringsstatus === Valideringsstatus.OK) {
                                            settSpinner(true);
                                            endreBruker(nyIdent.verdi)
                                                .then((feilmelding: string) => {
                                                    settFeilMelding(feilmelding);
                                                })
                                                .finally(() => {
                                                    settSpinner(false);
                                                });
                                        } else {
                                            settFeilMelding('Person ident er ugyldig');
                                        }
                                    }}
                                    children={'Endre bruker'}
                                    loading={spinner}
                                    size="small"
                                    variant="secondary"
                                />
                            </Box>
                        </HStack>
                        {hentFagsakPaaPersonError && (
                            <LocalAlert status={'error'}>
                                <LocalAlert.Header>
                                    <LocalAlert.Title>Klarte ikke å endre bruker</LocalAlert.Title>
                                </LocalAlert.Header>
                                <LocalAlert.Content>{hentFagsakPaaPersonError?.message}</LocalAlert.Content>
                            </LocalAlert>
                        )}
                    </VStack>
                )}
            </ExpansionCard.Content>
        </ExpansionCard>
    );
};
