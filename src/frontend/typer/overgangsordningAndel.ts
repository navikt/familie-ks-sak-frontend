import type { IsoMånedString } from '../utils/dato';

export interface IRestOvergangsordningAndel {
    id?: number;
    personIdent?: string;
    prosent?: number;
    fom?: IsoMånedString;
    tom?: IsoMånedString;
}
