import { mutationKeys } from '@hooks/keys/mutationKeys';
import { useMutationState } from '@tanstack/react-query';

export function useSlettEndretUtbetalingAndelIsPending(endretUtbetalingAndelId: number | undefined) {
    const states = useMutationState({
        filters: {
            mutationKey: mutationKeys.slettEndretUtbetalingAndel(endretUtbetalingAndelId),
        },
        select: mutation => mutation.state,
    });
    const currentState = states.at(-1);
    return currentState?.status === 'pending';
}
