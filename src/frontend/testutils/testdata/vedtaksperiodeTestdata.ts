import { type IVedtaksperiodeMedBegrunnelser, Vedtaksperiodetype } from '@typer/vedtaksperiode';

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
