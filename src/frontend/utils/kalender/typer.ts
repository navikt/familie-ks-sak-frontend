import type { IsoDatoString } from '../dato';

export type YearMonth = string; // Format YYYY-MM (ISO)

export interface IPeriode {
    // Format YYYY-MM-DD (ISO)
    fom?: IsoDatoString;
    tom?: IsoDatoString;
}

export interface IYearMonthPeriode {
    // Format YYYY-MM
    fom?: YearMonth;
    tom?: YearMonth;
}
