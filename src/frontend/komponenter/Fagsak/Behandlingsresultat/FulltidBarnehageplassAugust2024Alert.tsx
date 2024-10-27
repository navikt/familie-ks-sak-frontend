import React from 'react';

import styled from 'styled-components';

import { Alert } from '@navikt/ds-react';

import { PersonType } from '../../../typer/person';
import {
    finnUnikeIdenterForPersonTypeIUtbetalingsperioder,
    finnUtbetalingsperioderHvorTomErEnBestemtMåned,
    type Utbetalingsperiode,
} from '../../../typer/utbetalingsperiode';
import { formaterIdent } from '../../../utils/formatter';

interface Props {
    utbetalingsperioder: Utbetalingsperiode[];
}

const AUGUST_2024 = new Date(2024, 7);

const StyledAlert = styled(Alert)`
    margin-bottom: 1rem;
`;

export function FulltidBarnehageplassAugust2024Alert({ utbetalingsperioder }: Props) {
    const utbetalingsperioderHvorTomErAugust2024 = finnUtbetalingsperioderHvorTomErEnBestemtMåned(
        utbetalingsperioder,
        AUGUST_2024
    );

    if (utbetalingsperioderHvorTomErAugust2024.length == 0) {
        return null;
    }

    const identerForBarn = finnUnikeIdenterForPersonTypeIUtbetalingsperioder(
        utbetalingsperioderHvorTomErAugust2024,
        PersonType.BARN
    )
        .map(ident => formaterIdent(ident))
        .join(', ');

    return (
        <StyledAlert variant={'warning'}>
            Det er perioder som kan føre til utbetaling for barn {identerForBarn}. Kontroller om
            barnet hører inn under regelverk før lovendring 1. august 24. Bruk «Endret
            utbetalingsperiode» for å stoppe etterbetalingen hvis barnet hadde fulltidsplass i
            barnehage i august 24.
        </StyledAlert>
    );
}
