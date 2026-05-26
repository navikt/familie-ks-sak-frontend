import { HentFagsakPaaPersonMutationKeyFactory } from '@hooks/useHentFagsakPaaPerson';
import { useMutationState } from '@tanstack/react-query';

interface HentFagsakPaaPersonVariables {
    ident: string;
}

const UNSET = Symbol('UNSET');

export function useHentFagsakPaaPersonError(ident: string | null | undefined | typeof UNSET = UNSET) {
    const errors = useMutationState({
        filters: {
            mutationKey: HentFagsakPaaPersonMutationKeyFactory.hentFagsakPaaPerson(),
            predicate: mutation => {
                if (ident === UNSET) {
                    return true;
                }
                if (!ident) {
                    return false;
                }
                const variables = mutation.state.variables;
                if (!variables) {
                    return false;
                }
                return (variables as HentFagsakPaaPersonVariables).ident === ident;
            },
        },
        select: mutation => mutation.state.error,
    });
    return errors.at(-1);
}
