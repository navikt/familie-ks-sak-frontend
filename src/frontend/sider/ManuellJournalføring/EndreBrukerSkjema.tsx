import { Box, Button, HStack } from '@navikt/ds-react';
import { type Felt, Valideringsstatus } from '@navikt/familie-skjema';
import { EndreBrukerFelt } from '@sider/ManuellJournalføring/felter/EndreBrukerFelt';
import { useManuellJournalføringContext } from '@sider/ManuellJournalføring/ManuellJournalføringContext';
import { useEffect, useState } from 'react';

interface EndreBrukerSkjemaProps {
    nyIdent: Felt<string>;
}

export function EndreBrukerSkjema({ nyIdent }: EndreBrukerSkjemaProps) {
    const { endreBruker } = useManuellJournalføringContext();

    const [feilMelding, settFeilMelding] = useState<string | undefined>('');
    const [spinner, settSpinner] = useState(false);

    useEffect(() => {
        settFeilMelding('');
    }, [nyIdent.verdi]);

    return (
        <HStack marginBlock={'space-24'} wrap={false} gap={'space-16'}>
            <EndreBrukerFelt nyIdent={nyIdent} feilMelding={feilMelding} />
            <Box
                marginBlock={
                    nyIdent.hentNavInputProps(!!feilMelding).feil || feilMelding ? 'auto space-28' : 'auto space-0'
                }
                width={'10rem'}
            >
                <Button
                    onClick={() => {
                        if (nyIdent.valideringsstatus === Valideringsstatus.OK) {
                            settSpinner(true);
                            endreBruker(nyIdent.verdi)
                                .then((feilmelding: string | undefined) => {
                                    settFeilMelding(feilmelding);
                                })
                                .finally(() => {
                                    settSpinner(false);
                                });
                        } else {
                            settFeilMelding('Person ident er ugyldig');
                        }
                    }}
                    loading={spinner}
                    size="small"
                    variant="secondary"
                >
                    Endre bruker
                </Button>
            </Box>
        </HStack>
    );
}
