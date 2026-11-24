import { hentTilbakekrevingsbehandlinger } from '@api/hentTilbakekrevingsbehandlinger';
import { queryKeys } from '@hooks/keys/queryKeys';
import { MetaKey } from '@hooks/meta/metaKey';
import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { FagsakId } from '@typer/fagsak';
import type { ITilbakekrevingsbehandling } from '@typer/tilbakekrevingsbehandling';

type Options = Omit<UseQueryOptions<ITilbakekrevingsbehandling[]>, 'queryKey' | 'queryFn'>;

export function useHentTilbakekrevingsbehandlinger(fagsakId: FagsakId, options?: Options) {
    return useQuery({
        queryKey: queryKeys.tilbakekrevingsbehandlinger(fagsakId),
        queryFn: () => hentTilbakekrevingsbehandlinger(fagsakId),
        meta: { [MetaKey.VIS_SYSTEMET_LASTER]: true },
        ...options,
    });
}
