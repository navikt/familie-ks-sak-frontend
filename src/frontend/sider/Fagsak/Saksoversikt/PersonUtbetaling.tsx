import React from 'react';

import styled from 'styled-components';

import { BodyShort, HStack } from '@navikt/ds-react';
import { ASpacing2, ASpacing4, ASpacing8 } from '@navikt/ds-tokens/dist/tokens';

import PersonInformasjon from '../../../Felleskomponenter/PersonInformasjon/PersonInformasjon';
import type { IUtbetalingsperiodeDetalj } from '../../../typer/vedtaksperiode';
import { formaterBeløp } from '../../../utils/formatter';

const Ytelser = styled.section`
    margin: ${ASpacing2} 0 ${ASpacing4} ${ASpacing8};
    border-bottom: 1px dashed;
`;

const Ytelselinje = styled(HStack)`
    margin-bottom: ${ASpacing4};
`;

interface IPersonUtbetalingProps {
    utbetalingsperiodeDetaljer: IUtbetalingsperiodeDetalj[];
}

const PersonUtbetaling: React.FC<IPersonUtbetalingProps> = ({ utbetalingsperiodeDetaljer }) => {
    return (
        <section>
            <PersonInformasjon person={utbetalingsperiodeDetaljer[0].person} />
            <Ytelser>
                {utbetalingsperiodeDetaljer.map(utbetalingsperiodeDetalj => {
                    return (
                        <Ytelselinje
                            key={utbetalingsperiodeDetalj.person.personIdent}
                            justify="space-between"
                        >
                            <BodyShort>Kontantstøtte</BodyShort>
                            <BodyShort>
                                {formaterBeløp(utbetalingsperiodeDetalj.utbetaltPerMnd)}
                            </BodyShort>
                        </Ytelselinje>
                    );
                })}
            </Ytelser>
        </section>
    );
};

export default PersonUtbetaling;
