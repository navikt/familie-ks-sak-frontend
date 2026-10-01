import { isSameMonth } from 'date-fns/isSameMonth';
import { type IsoDatoString, isoStringTilDate } from '../utils/dato';
import type { PersonType } from './person';
import type { IUtbetalingsperiodeDetalj, Vedtaksperiodetype } from './vedtaksperiode';

export type Utbetalingsperiode = {
    periodeFom: IsoDatoString;
    periodeTom?: IsoDatoString;
    vedtaksperiodetype: Vedtaksperiodetype.UTBETALING;
    utbetalingsperiodeDetaljer: IUtbetalingsperiodeDetalj[];
    antallBarn: number;
    utbetaltPerMnd: number;
};

export function finnUnikeIdenterForPersonTypeIUtbetalingsperioder(
    utbetalingsperioder: Utbetalingsperiode[],
    personType: PersonType
): string[] {
    const identer = utbetalingsperioder
        .flatMap(utbetalingsperiode => utbetalingsperiode.utbetalingsperiodeDetaljer)
        .map(detalj => detalj.person)
        .filter(person => person.type == personType)
        .map(person => person.personIdent);
    return [...new Set(identer)];
}

export function finnUtbetalingsperioderHvorTomErEnBestemtMåned(
    utbetalingsperioder: Utbetalingsperiode[],
    bestemtMåned: Date
): Utbetalingsperiode[] {
    return utbetalingsperioder.filter(utbetalingsperiode => {
        if (utbetalingsperiode.periodeTom == undefined) {
            return false;
        }
        const tomDato = isoStringTilDate(utbetalingsperiode.periodeTom);
        return isSameMonth(tomDato, bestemtMåned);
    });
}
