import { slettEndretUtbetalingAndel } from '@api/slettEndretUtbetalingAndel';
import { mutationKeys } from '@hooks/keys/mutationKeys';
import { type DefaultError, type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { IBehandling } from '@typer/behandling';

interface Parameters {
    behandlingId: number;
    endretUtbetalingAndelId?: number;
}

type Options = Omit<UseMutationOptions<IBehandling, DefaultError, void>, 'mutationFn' | 'mutationKey'>;

export function useSlettEndretUtbetalingAndel(
    { behandlingId, endretUtbetalingAndelId }: Parameters,
    options?: Options
) {
    if (endretUtbetalingAndelId === undefined) {
        throw new Error('Kan ikke slette endretUtbetalingAndel uten id');
    }
    return useMutation({
        mutationKey: mutationKeys.slettEndretUtbetalingAndel(endretUtbetalingAndelId),
        mutationFn: () => slettEndretUtbetalingAndel(behandlingId, endretUtbetalingAndelId),
        ...options,
    });
}
