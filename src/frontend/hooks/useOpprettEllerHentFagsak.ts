import { opprettEllerHentFagsak } from '@api/opprettEllerHentFagsak';
import { type DefaultError, useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { IMinimalFagsak } from '@typer/fagsak';

import { useHttp } from '@navikt/familie-http';

export const OpprettEllerHentFagsakMutationKeyFactory = {
    opprettEllerHentFagsakData: () => ['opprett-eller-hent-fagsak'],
};

interface Parameters {
    aktørId: string;
}

type Options = Omit<UseMutationOptions<IMinimalFagsak, DefaultError, Parameters>, 'mutationFn'>;

export function useOpprettEllerHentFagsak(options?: Options) {
    const { request } = useHttp();
    return useMutation({
        mutationFn: (parameters: Parameters) => {
            return opprettEllerHentFagsak(request, parameters);
        },
        mutationKey: OpprettEllerHentFagsakMutationKeyFactory.opprettEllerHentFagsakData(),
        ...options,
    });
}
