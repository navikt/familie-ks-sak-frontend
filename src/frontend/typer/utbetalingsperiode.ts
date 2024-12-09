import { isSameMonth } from 'date-fns/isSameMonth';

import type { PersonType } from './person';
import type { Vedtaksperiodetype } from './vedtaksperiode';
import { type IUtbetalingsperiodeDetalj } from './vedtaksperiode';
import { type IsoDatoString, isoStringTilDate } from '../utils/dato';

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
