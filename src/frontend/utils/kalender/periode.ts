import type { IsoDatoString } from '../dato';

import type { IPeriode, IYearMonthPeriode, YearMonth } from '.';

export const nyPeriode = (fom?: IsoDatoString, tom?: IsoDatoString): IPeriode => {
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
