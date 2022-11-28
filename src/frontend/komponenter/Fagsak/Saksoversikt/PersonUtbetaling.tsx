import React from 'react';

import { BodyShort } from '@navikt/ds-react';

import type { IUtbetalingsperiodeDetalj } from '../../../typer/vedtaksperiode';
import { formaterBeløp } from '../../../utils/formatter';
import DashedHr from '../../Felleskomponenter/DashedHr/DashedHr';
import PersonInformasjon from '../../Felleskomponenter/PersonInformasjon/PersonInformasjon';

interface IPersonUtbetalingProps {
    utbetalingsperiodeDetaljer: IUtbetalingsperiodeDetalj[];
}

const PersonUtbetaling: React.FC<IPersonUtbetalingProps> = ({ utbetalingsperiodeDetaljer }) => {
    return (
        <li>
            <PersonInformasjon person={utbetalingsperiodeDetaljer[0].person} />
            <div className={'saksoversikt__utbetalinger__ytelser'}>
                {utbetalingsperiodeDetaljer.map((utbetalingsperiodeDetalj, index) => {
                    return (
                        <div key={index} className={'saksoversikt__utbetalinger__ytelselinje'}>
                            <BodyShort>Kontantstøtte</BodyShort>
                            <BodyShort>
                                {formaterBeløp(utbetalingsperiodeDetalj.utbetaltPerMnd)}
                            </BodyShort>
                        </div>
                    );
                })}
                <DashedHr />
            </div>
        </li>
    );
};

export default PersonUtbetaling;
