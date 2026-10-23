import { YtelseType } from '@typer/beregning';
import type { Utbetalingsperiode } from '@typer/utbetalingsperiode';
import { BegrunnelseType } from '@typer/vedtak';
import {
    type IUtbetalingsperiodeDetalj,
    type IVedtaksperiodeMedBegrunnelser,
    Vedtaksperiodetype,
} from '@typer/vedtaksperiode';
import type { AlleBegrunnelser } from '@typer/vilkår';

import { lagGrunnlagPerson } from './personTestdata';

export function lagAlleBegrunnelser(begrunnelser: Partial<AlleBegrunnelser> = {}): AlleBegrunnelser {
    const tomListePerType = Object.fromEntries(
        Object.values(BegrunnelseType).map(type => [type, []])
    ) as unknown as AlleBegrunnelser;
    return {
        ...tomListePerType,
        ...begrunnelser,
    };
}

export function lagVedtaksperiodeMedBegrunnelser(
    vedtaksperiode?: Partial<IVedtaksperiodeMedBegrunnelser>
): IVedtaksperiodeMedBegrunnelser {
    return {
        id: 1,
        type: Vedtaksperiodetype.UTBETALING,
        begrunnelser: [],
        eøsBegrunnelser: [],
        fritekster: [],
        gyldigeBegrunnelser: [],
        utbetalingsperiodeDetaljer: [],
        støtterFritekst: false,
        ...vedtaksperiode,
    };
}

export function lagUtbetalingsperiodeDetalj(
    utbetalingsperiodeDetalj: Partial<IUtbetalingsperiodeDetalj> = {}
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

export function lagUtbetalingsperiode(utbetalingsperiode: Partial<Utbetalingsperiode> = {}): Utbetalingsperiode {
    const utbetalingsperiodeDetaljer = utbetalingsperiode.utbetalingsperiodeDetaljer ?? [lagUtbetalingsperiodeDetalj()];
    return {
        periodeFom: '2025-01-01',
        periodeTom: undefined,
        vedtaksperiodetype: Vedtaksperiodetype.UTBETALING,
        utbetalingsperiodeDetaljer,
        antallBarn: utbetalingsperiodeDetaljer.length,
        utbetaltPerMnd: utbetalingsperiodeDetaljer.reduce((sum, detalj) => sum + detalj.utbetaltPerMnd, 0),
        ...utbetalingsperiode,
    };
}

export * as VedtaksperiodeTestdata from './vedtaksperiodeTestdata';
