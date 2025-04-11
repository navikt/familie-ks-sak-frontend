import React, { useEffect, useState } from 'react';

import styled from 'styled-components';

import { Button, ExpansionCard, TextField } from '@navikt/ds-react';
import { useFelt, Valideringsstatus } from '@navikt/familie-skjema';

import { DeltagerInfo } from './DeltagerInfo';
import { useManuellJournalførContext } from '../../context/ManuellJournalførContext';
import { KontoSirkel } from '../../ikoner/KontoSirkel';
import { formaterIdent } from '../../utils/formatter';
import { identValidator } from '../../utils/validators';

const FlexDiv = styled.div`
    display: flex;
    margin-bottom: 1.5rem;
`;

const StyledExpansionCard = styled(ExpansionCard)`
    margin-top: 1rem;
    width: 100%;
`;

const StyledButton = styled(Button)`
    margin-left: 1rem;
    margin-top: auto;
    width: 10rem;
`;

const StyledExpansionContent = styled(ExpansionCard.Content)`
    .navds-expansioncard__content-inner {
        margin: 1rem 4rem;
    }
    padding: 0.5rem 1rem 1rem;
`;

export const BrukerPanel: React.FC = () => {
    const { skjema, endreBruker, erLesevisning } = useManuellJournalførContext();
    const [åpen, settÅpen] = useState(false);
    const [feilMelding, settFeilMelding] = useState<string | undefined>('');
    const [spinner, settSpinner] = useState(false);
    const nyIdent = useFelt({
        verdi: '',
        valideringsfunksjon: identValidator,
    });
    useEffect(() => {
        settFeilMelding('');
    }, [nyIdent.verdi]);

    useEffect(() => {
        if (
            skjema.visFeilmeldinger &&
            skjema.felter.bruker.valideringsstatus === Valideringsstatus.FEIL
        ) {
            settÅpen(true);
        }
    }, [skjema.visFeilmeldinger, skjema.felter.bruker.valideringsstatus]);

    return (
        <StyledExpansionCard
            open={åpen}
            onToggle={() => {
                settÅpen(!åpen);
            }}
            aria-label={skjema.felter.bruker.verdi?.navn || 'Ukjent bruker'}
            size="small"
        >
            <ExpansionCard.Header>
                <ExpansionCard.Title>
                    <DeltagerInfo
                        ikon={<KontoSirkel filled={åpen} width={48} height={48} />}
                        navn={skjema.felter.bruker.verdi?.navn || 'Ukjent bruker'}
                        undertittel={'Søker/Bruker'}
                        ident={formaterIdent(skjema.felter.bruker.verdi?.personIdent ?? '')}
                    />
                </ExpansionCard.Title>
            </ExpansionCard.Header>
            <StyledExpansionContent>
                {!erLesevisning() && (
                    <FlexDiv>
                        <TextField
                            {...nyIdent.hentNavInputProps(!!feilMelding)}
                            error={nyIdent.hentNavInputProps(!!feilMelding).feil || feilMelding}
                            label={'Endre bruker'}
                            description={'Skriv inn brukers/søkers fødselsnummer eller D-nummer'}
                            size="small"
                        />
                        <StyledButton
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
                    </FlexDiv>
                )}
            </StyledExpansionContent>
        </StyledExpansionCard>
    );
};
