import { opprettEllerHentFagsak } from '@api/opprettEllerHentFagsak';
import { MetaKey } from '@hooks/meta/metaKey';
import { type DefaultError, useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { IMinimalFagsak } from '@typer/fagsak';

export const OpprettEllerHentFagsakMutationKeyFactory = {
    opprettEllerHentFagsak: () => ['opprett_eller_hent_fagsak'],
};

interface Parameters {
    aktørId: string;
}

type Options = Omit<UseMutationOptions<IMinimalFagsak, DefaultError, Parameters>, 'mutationFn'>;

export function useOpprettEllerHentFagsak(options?: Options) {
    return useMutation({
        mutationKey: OpprettEllerHentFagsakMutationKeyFactory.opprettEllerHentFagsak(),
        mutationFn: (parameters: Parameters) => {
            const { aktørId } = parameters;
            const payload = { aktørId };
            return opprettEllerHentFagsak(payload);
        },
        meta: { [MetaKey.VIS_SYSTEMET_LASTER]: true },
        ...options,
    });
}
