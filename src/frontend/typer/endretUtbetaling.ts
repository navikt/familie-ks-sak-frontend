import type { IEndretUtbetalingAndelÅrsak } from './utbetalingAndel';
import type { Begrunnelse, BegrunnelseType } from './vedtak';

export interface IRestBegrunnelseTilknyttetEndretUtbetaling {
    id: Begrunnelse;
    navn: string;
    endringsårsaker: IEndretUtbetalingAndelÅrsak[];
}

export type EndringsårsakbegrunnelseTekster = {
    [key in BegrunnelseType]: IRestBegrunnelseTilknyttetEndretUtbetaling[];
};
