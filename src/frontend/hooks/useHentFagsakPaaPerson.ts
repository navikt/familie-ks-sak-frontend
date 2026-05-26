import { hentFagsakPaaPerson } from '@api/hentFagsakPaaPerson';
import { MetaKey } from '@hooks/meta/metaKey';
import { type DefaultError, useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { IMinimalFagsak } from '@typer/fagsak';

export const HentFagsakPaaPersonMutationKeyFactory = {
    hentFagsakPaaPerson: () => ['hent_fagsak_paa_person'],
};

interface Parameters {
    ident: string;
}

type Options = Omit<UseMutationOptions<IMinimalFagsak, DefaultError, Parameters>, 'mutationFn'>;

export function useHentFagsakPaaPerson(options?: Options) {
    return useMutation({
        mutationKey: HentFagsakPaaPersonMutationKeyFactory.hentFagsakPaaPerson(),
        mutationFn: (parameters: Parameters) => {
            const { ident } = parameters;
            const payload = { ident };
            return hentFagsakPaaPerson(payload);
        },
        meta: { [MetaKey.VIS_SYSTEMET_LASTER]: true },
        ...options,
    });
}
