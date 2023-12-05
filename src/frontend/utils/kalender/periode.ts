import { isAfter, isBefore, isSameDay } from 'date-fns';

import type { IsoDatoString } from '../dato';
import { isoStringTilDate, isoStringTilDateMedFallback, tidenesEnde } from '../dato';

import type { FamilieIsoDate, IPeriode, IYearMonthPeriode, YearMonth } from '.';
import { kalenderDatoMedFallback, TIDENES_ENDE, kalenderDiff, kalenderDatoTilDate } from '.';

export const nyPeriode = (fom?: FamilieIsoDate, tom?: FamilieIsoDate): IPeriode => {
    return {
        fom: fom !== '' && fom ? fom : undefined,
        tom: tom !== '' && tom ? tom : undefined,
    };
};

export const nyYearMonthPeriode = (fom?: YearMonth, tom?: YearMonth): IYearMonthPeriode => {
    return {
        fom: fom !== '' && fom ? fom : undefined,
        tom: tom !== '' && tom ? tom : undefined,
    };
};

export const periodeOverlapperMedValgtDato = (
    periodeFom: IsoDatoString,
    periodeTom: IsoDatoString | undefined,
    valgtDato: Date
) => {
    const periodeFomDate = isoStringTilDate(periodeFom);
    const periodeTomDate = isoStringTilDateMedFallback({
        isoString: periodeTom,
        fallbackDate: tidenesEnde,
    });

    return (
        (isAfter(valgtDato, periodeFomDate) && isBefore(valgtDato, periodeTomDate)) ||
        isSameDay(valgtDato, periodeFomDate) ||
        isSameDay(valgtDato, periodeTomDate)
    );
};

export const periodeDiff = (første: IPeriode, andre: IPeriode) => {
    if (!første.fom && !første.tom) {
        return 1;
    }
    return kalenderDiff(
        kalenderDatoTilDate(kalenderDatoMedFallback(første.fom, TIDENES_ENDE)),
        kalenderDatoTilDate(kalenderDatoMedFallback(andre.fom, TIDENES_ENDE))
    );
};
