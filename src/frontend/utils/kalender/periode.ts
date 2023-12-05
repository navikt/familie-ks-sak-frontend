import type { FamilieIsoDate, IPeriode, IYearMonthPeriode, YearMonth } from '.';

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
