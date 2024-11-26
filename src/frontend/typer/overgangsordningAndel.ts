import type { IsoMånedString } from '../utils/dato';

export interface IRestOvergangsordningAndel {
    id: number;
    personIdent?: string;
    antallTimer?: number;
    deltBosted: boolean;
    fom?: IsoMånedString;
    tom?: IsoMånedString;
}

export interface IOvergangsordningAndelSkjema {
    personIdent: string | undefined;
    antallTimer: string | undefined;
    deltBosted: boolean;
    fom: Date | undefined;
    tom: Date | undefined;
}
