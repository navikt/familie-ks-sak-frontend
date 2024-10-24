import type { IPar } from './common';
import type { IsoMånedString } from '../utils/dato';

export interface IPersonMedAndelerTilkjentYtelse {
    personIdent: string;
    ytelsePerioder: IYtelsePeriode[];
    beløp: number;
    stønadFom: IsoMånedString;
    stønadTom: IsoMånedString;
}

export interface IYtelsePeriode {
    beløp: number;
    stønadFom: IsoMånedString;
    stønadTom: IsoMånedString;
    ytelseType: YtelseType;
    skalUtbetales: boolean;
}

export enum YtelseType {
    ORDINÆR_KONTANTSTØTTE = 'ORDINÆR_KONTANTSTØTTE',
    OVERGANGSORDNING = 'OVERGANGSORDNING',
}

export const ytelsetype: Record<YtelseType, IPar> = {
    ORDINÆR_KONTANTSTØTTE: {
        id: YtelseType.ORDINÆR_KONTANTSTØTTE,
        navn: 'Ordinær',
    },
    OVERGANGSORDNING: {
        id: YtelseType.OVERGANGSORDNING,
        navn: 'Overgangsordning',
    },
};
