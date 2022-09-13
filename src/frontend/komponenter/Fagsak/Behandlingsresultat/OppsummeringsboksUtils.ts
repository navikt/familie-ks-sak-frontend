import { YtelseType } from '../../../typer/beregning';
import type { Utbetalingsperiode } from '../../../typer/vedtaksperiode';
import { kalenderDato, kalenderDatoFraDate, kalenderDiffMåned } from '../../../utils/kalender';

export const kanFjerneSmåbarnstilleggFraPeriode = (
    utbetalingsperiode: Utbetalingsperiode
): boolean => {
    return utbetalingsperiode.utbetalingsperiodeDetaljer.some(
        detalj => detalj.ytelseType === YtelseType.SMÅBARNSTILLEGG
    );
};

const sjekkOmTilOgMed3ÅrIPeriode = (fødselsdato: string, periode: Date): boolean => {
    const antallMndForskjell = kalenderDiffMåned(
        kalenderDato(fødselsdato),
        kalenderDatoFraDate(periode)
    );

    return antallMndForskjell <= 36;
};

export const kanLeggeSmåbarnstilleggTilPeriode = (
    utbetalingsperiode: Utbetalingsperiode,
    periode: Date
): boolean => {
    const harUtvidetYtelse = utbetalingsperiode.ytelseTyper.some(
        ytelsetype => ytelsetype === YtelseType.UTVIDET_BARNETRYGD
    );

    const harPersonTilOgMed3ÅrIPeriode = utbetalingsperiode.utbetalingsperiodeDetaljer.some(
        utbetalingsPerideDetalj =>
            sjekkOmTilOgMed3ÅrIPeriode(utbetalingsPerideDetalj.person.fødselsdato, periode)
    );

    return (
        harUtvidetYtelse &&
        harPersonTilOgMed3ÅrIPeriode &&
        !kanFjerneSmåbarnstilleggFraPeriode(utbetalingsperiode)
    );
};
