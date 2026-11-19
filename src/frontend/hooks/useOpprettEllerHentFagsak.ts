import { opprettEllerHentFagsak } from '@api/opprettEllerHentFagsak';
import { mutationKeys } from '@hooks/keys/mutationKeys';
import { MetaKey } from '@hooks/meta/metaKey';
import { type DefaultError, type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { IMinimalFagsak } from '@typer/fagsak';

interface Parameters {
    aktørId: string;
}

type Options = Omit<UseMutationOptions<IMinimalFagsak, DefaultError, Parameters>, 'mutationKey' | 'mutationFn'>;

export function useOpprettEllerHentFagsak(options?: Options) {
    return useMutation({
        mutationKey: mutationKeys.opprettEllerHentFagsak(),
        mutationFn: (parameters: Parameters) => {
            const { aktørId } = parameters;
            const payload = { aktørId };
            return opprettEllerHentFagsak(payload);
        },
        meta: { [MetaKey.VIS_SYSTEMET_LASTER]: true },
        ...options,
    });
}
