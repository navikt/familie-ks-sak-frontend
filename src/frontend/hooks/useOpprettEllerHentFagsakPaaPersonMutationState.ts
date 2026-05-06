import { OpprettEllerHentFagsakPaaPersonMutationKeyFactory } from '@hooks/useOpprettEllerHentFagsakPaaPerson';
import { useMutationState } from '@tanstack/react-query';

export function useOpprettEllerHentFagsakPaaPersonMutationState() {
    return useMutationState({
        filters: {
            mutationKey: OpprettEllerHentFagsakPaaPersonMutationKeyFactory.opprettEllerHentFagsakPaaPersonData(),
        },
        select: mutation => mutation.state,
    });
}
