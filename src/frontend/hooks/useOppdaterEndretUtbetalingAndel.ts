import { oppdaterEndretUtbetalingAndel } from '@api/oppdaterEndretUtbetalingAndel';
import { type DefaultError, type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { IBehandling } from '@typer/behandling';
import type { IRestEndretUtbetalingAndel } from '@typer/utbetalingAndel';

export const OppdaterEndretUtbetalingAndelMutationKeyFactory = {
    endretUtbetalingAndel: (endretUtbetalingAndelId: number) => [
        'oppdaterEndretUtbetalingAndel',
        endretUtbetalingAndelId,
    ],
};

interface Parameters {
    behandlingId: number;
    endretUtbetalingAndelId?: number;
}

type Options = Omit<
    UseMutationOptions<IBehandling, DefaultError, IRestEndretUtbetalingAndel>,
    'mutationFn' | 'mutationKey'
>;

export function useOppdaterEndretUtbetalingAndel(
    { behandlingId, endretUtbetalingAndelId }: Parameters,
    options?: Options
) {
    if (endretUtbetalingAndelId === undefined) {
        throw new Error('Kan ikke oppdatere endretUtbetalingAndel uten id');
    }
    return useMutation({
        mutationKey: OppdaterEndretUtbetalingAndelMutationKeyFactory.endretUtbetalingAndel(endretUtbetalingAndelId),
        mutationFn: (payload: IRestEndretUtbetalingAndel) =>
            oppdaterEndretUtbetalingAndel(behandlingId, endretUtbetalingAndelId, payload),
        ...options,
    });
}
