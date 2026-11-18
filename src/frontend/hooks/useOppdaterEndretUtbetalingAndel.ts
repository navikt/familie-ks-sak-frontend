import { oppdaterEndretUtbetalingAndel } from '@api/oppdaterEndretUtbetalingAndel';
import { mutationKeys } from '@hooks/keys/mutationKeys';
import { type DefaultError, type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { IBehandling } from '@typer/behandling';
import type { IRestEndretUtbetalingAndel } from '@typer/utbetalingAndel';

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
        mutationKey: mutationKeys.oppdaterEndretUtbetalingAndel(endretUtbetalingAndelId),
        mutationFn: (payload: IRestEndretUtbetalingAndel) =>
            oppdaterEndretUtbetalingAndel(behandlingId, endretUtbetalingAndelId, payload),
        ...options,
    });
}
