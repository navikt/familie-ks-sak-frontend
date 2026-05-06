import { OpprettEllerHentFagsakMutationKeyFactory } from '@hooks/useOpprettEllerHentFagsak';
import { useMutationState } from '@tanstack/react-query';

export function useOpprettEllerHentFagsakMutationState() {
    return useMutationState({
        filters: {
            mutationKey: OpprettEllerHentFagsakMutationKeyFactory.opprettEllerHentFagsakData(),
        },
        select: mutation => mutation.state,
    });
}
