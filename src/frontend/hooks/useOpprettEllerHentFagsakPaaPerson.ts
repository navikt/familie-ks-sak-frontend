import { opprettEllerHentFagsakPaaPerson } from '@api/opprettEllerHentFagsakPaaPerson';
import { type DefaultError, useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { IMinimalFagsak } from '@typer/fagsak';

import { useHttp } from '@navikt/familie-http';

export const OpprettEllerHentFagsakPaaPersonMutationKeyFactory = {
    opprettEllerHentFagsakPaaPersonData: () => ['opprett-eller-hent-fagsak-paa-person'],
};

interface Parameters {
    ident: string;
}

type Options = Omit<UseMutationOptions<IMinimalFagsak, DefaultError, Parameters>, 'mutationFn'>;

export function useOpprettEllerHentFagsakPaaPerson(options?: Options) {
    const { request } = useHttp();
    return useMutation({
        mutationFn: (parameters: Parameters) => {
            return opprettEllerHentFagsakPaaPerson(request, parameters);
        },
        mutationKey: OpprettEllerHentFagsakPaaPersonMutationKeyFactory.opprettEllerHentFagsakPaaPersonData(),
        ...options,
    });
}
