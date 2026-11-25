import { hentKlagebehandlinger } from '@api/hentKlagebehandlinger';
import { queryKeys } from '@hooks/keys/queryKeys';
import { MetaKey } from '@hooks/meta/metaKey';
import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { FagsakId } from '@typer/fagsak';
import type { IKlagebehandling } from '@typer/klage';

type Options = Omit<UseQueryOptions<IKlagebehandling[]>, 'queryKey' | 'queryFn'>;

export function useHentKlagebehandlinger(fagsakId: FagsakId, options?: Options) {
    return useQuery({
        queryKey: queryKeys.klagebehandlinger(fagsakId),
        queryFn: () => hentKlagebehandlinger(fagsakId),
        meta: { [MetaKey.VIS_SYSTEMET_LASTER]: true },
        ...options,
    });
}
