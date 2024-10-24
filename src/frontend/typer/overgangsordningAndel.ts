import type { IsoMånedString } from '../utils/dato';

export interface IRestOvergangsordningAndel {
    id?: number;
    personIdent?: string;
    antallTimer: string | undefined;
    deltBosted: boolean;
    fom?: IsoMånedString;
    tom?: IsoMånedString;
}
