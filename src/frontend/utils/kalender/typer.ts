export type YearMonth = string; // Format YYYY-MM (ISO)
export type FamilieIsoDate = string; // Format YYYY-MM-DD (ISO)

export interface IPeriode {
    // Format YYYY-MM-DD (ISO)
    fom?: FamilieIsoDate;
    tom?: FamilieIsoDate;
}

export interface IYearMonthPeriode {
    // Format YYYY-MM
    fom?: YearMonth;
    tom?: YearMonth;
}
