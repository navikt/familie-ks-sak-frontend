import { mutationKeys } from '@hooks/keys/mutationKeys';
import { useMutationState } from '@tanstack/react-query';

export function useOppdaterEndretUtbetalingAndelIsPending(endretUtbetalingAndelId: number) {
    const states = useMutationState({
        filters: {
            mutationKey: mutationKeys.oppdaterEndretUtbetalingAndel(endretUtbetalingAndelId),
        },
        select: mutation => mutation.state,
    });
    const currentState = states.at(-1);
    return currentState?.status === 'pending';
}
