import { slettEndretUtbetalingAndel } from '@api/slettEndretUtbetalingAndel';
import { type DefaultError, type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { IBehandling } from '@typer/behandling';

export const SlettEndretUtbetalingAndelMutationKeyFactory = {
    endretUtbetalingAndel: (endretUtbetalingAndelId: number | undefined) => [
        'slettEndretUtbetalingAndel',
        endretUtbetalingAndelId,
    ],
};

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
        mutationKey: SlettEndretUtbetalingAndelMutationKeyFactory.endretUtbetalingAndel(endretUtbetalingAndelId),
        mutationFn: () => slettEndretUtbetalingAndel(behandlingId, endretUtbetalingAndelId),
        ...options,
    });
}
