import type { IsoMånedString } from '../utils/dato';

export interface IRestOvergangsordningAndel {
    id: number;
    personIdent?: string;
    antallTimer: number | undefined;
    deltBosted: boolean;
    fom?: IsoMånedString;
    tom?: IsoMånedString;
}

export interface IRestOvergangsordningAndelSkjemaFelt {
    personIdent: string | undefined;
    antallTimer: string | undefined;
    deltBosted: boolean;
    fom: Date | undefined;
    tom: Date | undefined;
}
