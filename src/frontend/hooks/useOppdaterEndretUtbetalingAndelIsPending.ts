import { useMutationState } from '@tanstack/react-query';

import { OppdaterEndretUtbetalingAndelMutationKeyFactory } from './useOppdaterEndretUtbetalingAndel';

export function useOppdaterEndretUtbetalingAndelIsPending(endretUtbetalingAndelId: number) {
    const states = useMutationState({
        filters: {
            mutationKey: OppdaterEndretUtbetalingAndelMutationKeyFactory.endretUtbetalingAndel(endretUtbetalingAndelId),
        },
        select: mutation => mutation.state,
    });
    const currentState = states.at(-1);
    return currentState?.status === 'pending';
}
