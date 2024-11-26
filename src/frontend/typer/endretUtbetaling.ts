import type { Begrunnelse, BegrunnelseType } from './vedtak';
import type { VilkårType } from './vilkår';

export interface IRestBegrunnelseTilknyttetEndretUtbetaling {
    id: Begrunnelse;
    navn: string;
    vilkår?: VilkårType;
}

export type EndringsårsakbegrunnelseTekster = {
    [key in BegrunnelseType]: IRestBegrunnelseTilknyttetEndretUtbetaling[];
};
