import styled from 'styled-components';

import { BodyShort, HStack } from '@navikt/ds-react';
import { Space16, Space32, Space8 } from '@navikt/ds-tokens/dist/tokens';

import { PersonInformasjonUtbetaling } from './PersonInformasjonUtbetaling';
import type { IUtbetalingsperiodeDetalj } from '../../../typer/vedtaksperiode';
import { formaterBeløp } from '../../../utils/formatter';

const Ytelser = styled.section`
    margin: ${Space8} 0 ${Space16} ${Space32};
    border-bottom: 1px dashed;
`;

const Ytelselinje = styled(HStack)`
    margin-bottom: ${Space16};
`;

interface IPersonUtbetalingProps {
    utbetalingsperiodeDetaljer: IUtbetalingsperiodeDetalj[];
}

const PersonUtbetaling = ({ utbetalingsperiodeDetaljer }: IPersonUtbetalingProps) => {
    return (
        <section>
            <PersonInformasjonUtbetaling person={utbetalingsperiodeDetaljer[0].person} />
            <Ytelser>
                {utbetalingsperiodeDetaljer.map(utbetalingsperiodeDetalj => {
                    return (
                        <Ytelselinje key={utbetalingsperiodeDetalj.person.personIdent} justify="space-between">
                            <BodyShort>Kontantstøtte</BodyShort>
                            <BodyShort>{formaterBeløp(utbetalingsperiodeDetalj.utbetaltPerMnd)}</BodyShort>
                        </Ytelselinje>
                    );
                })}
            </Ytelser>
        </section>
    );
};

export default PersonUtbetaling;
