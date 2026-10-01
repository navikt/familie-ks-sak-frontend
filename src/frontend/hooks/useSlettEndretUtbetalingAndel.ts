import { slettEndretUtbetalingAndel } from '@api/slettEndretUtbetalingAndel';
import { type DefaultError, type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { IBehandling } from '@typer/behandling';

export const SlettEndretUtbetalingAndelMutationKeyFactory = {
    endretUtbetalingAndel: (endretUtbetalingAndelId: number) => ['slettEndretUtbetalingAndel', endretUtbetalingAndelId],
};

interface Parameters {
    behandlingId: number;
}

type Options = Omit<UseMutationOptions<IBehandling, DefaultError, Parameters>, 'mutationFn' | 'mutationKey'>;

export function useSlettEndretUtbetalingAndel(endretUtbetalingAndelId: number, options?: Options) {
    return useMutation({
        mutationKey: SlettEndretUtbetalingAndelMutationKeyFactory.endretUtbetalingAndel(endretUtbetalingAndelId),
        mutationFn: ({ behandlingId }: Parameters) => slettEndretUtbetalingAndel(behandlingId, endretUtbetalingAndelId),
        ...options,
    });
}
