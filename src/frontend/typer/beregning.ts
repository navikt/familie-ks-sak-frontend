import type { IPar } from './common';
import type { YearMonth } from '../utils/kalender';

export interface IPersonMedAndelerTilkjentYtelse {
    personIdent: string;
    ytelsePerioder: IYtelsePeriode[];
    beløp: number;
    stønadFom: YearMonth;
    stønadTom: YearMonth;
}

export interface IYtelsePeriode {
    beløp: number;
    stønadFom: YearMonth;
    stønadTom: YearMonth;
    ytelseType: YtelseType;
    skalUtbetales: boolean;
}

export enum YtelseType {
    ORDINÆR_KONTANTSTØTTE = 'ORDINÆR_KONTANTSTØTTE',
}

export const ytelsetype: Record<YtelseType, IPar> = {
    ORDINÆR_KONTANTSTØTTE: {
        id: 'ORDINÆR_KONTANTSTØTTE',
        navn: 'Ordinær',
    },
};
