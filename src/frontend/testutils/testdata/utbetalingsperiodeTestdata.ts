import { YtelseType } from '@typer/beregning';
import type { Utbetalingsperiode } from '@typer/utbetalingsperiode';
import { type IUtbetalingsperiodeDetalj, Vedtaksperiodetype } from '@typer/vedtaksperiode';

import { lagGrunnlagPerson } from './personTestdata';

export function lagUtbetalingsperiodeDetalj(
    utbetalingsperiodeDetalj?: Partial<IUtbetalingsperiodeDetalj>
): IUtbetalingsperiodeDetalj {
    return {
        person: lagGrunnlagPerson(),
        utbetaltPerMnd: 7500,
        prosent: 100,
        ytelseType: YtelseType.ORDINÆR_KONTANTSTØTTE,
        erPåvirketAvEndring: false,
        ...utbetalingsperiodeDetalj,
    };
}

export function lagUtbetalingsperiode(utbetalingsperiode?: Partial<Utbetalingsperiode>): Utbetalingsperiode {
    return {
        periodeFom: '2024-01-01',
        periodeTom: '2024-12-31',
        vedtaksperiodetype: Vedtaksperiodetype.UTBETALING,
        utbetalingsperiodeDetaljer: [],
        antallBarn: 0,
        utbetaltPerMnd: 0,
        ...utbetalingsperiode,
    };
}
