import { hentFagsakPaaPerson } from '@api/hentFagsakPaaPerson';
import { mutationKeys } from '@hooks/keys/mutationKeys';
import { MetaKey } from '@hooks/meta/metaKey';
import { type DefaultError, type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { IMinimalFagsak } from '@typer/fagsak';

interface Parameters {
    ident: string;
}

type Options = Omit<UseMutationOptions<IMinimalFagsak, DefaultError, Parameters>, 'mutationKey' | 'mutationFn'>;

export function useHentFagsakPaaPerson(options?: Options) {
    return useMutation({
        mutationKey: mutationKeys.hentFagsakPaaPerson(),
        mutationFn: (parameters: Parameters) => {
            const { ident } = parameters;
            const payload = { ident };
            return hentFagsakPaaPerson(payload);
        },
        meta: { [MetaKey.VIS_SYSTEMET_LASTER]: true },
        ...options,
    });
}
