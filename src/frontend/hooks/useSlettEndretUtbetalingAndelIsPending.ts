import { useMutationState } from '@tanstack/react-query';

import { SlettEndretUtbetalingAndelMutationKeyFactory } from './useSlettEndretUtbetalingAndel';

export function useSlettEndretUtbetalingAndelIsPending(endretUtbetalingAndelId: number) {
    const states = useMutationState({
        filters: {
            mutationKey: SlettEndretUtbetalingAndelMutationKeyFactory.endretUtbetalingAndel(endretUtbetalingAndelId),
        },
        select: mutation => mutation.state,
    });
    const currentState = states.at(-1);
    return currentState?.status === 'pending';
}
