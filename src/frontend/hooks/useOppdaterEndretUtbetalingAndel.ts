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
    payload: IRestEndretUtbetalingAndel;
}

type Options = Omit<UseMutationOptions<IBehandling, DefaultError, Parameters>, 'mutationFn' | 'mutationKey'>;

export function useOppdaterEndretUtbetalingAndel(endretUtbetalingAndelId: number, options?: Options) {
    return useMutation({
        mutationKey: OppdaterEndretUtbetalingAndelMutationKeyFactory.endretUtbetalingAndel(endretUtbetalingAndelId),
        mutationFn: ({ behandlingId, payload }: Parameters) =>
            oppdaterEndretUtbetalingAndel(behandlingId, endretUtbetalingAndelId, payload),
        ...options,
    });
}
