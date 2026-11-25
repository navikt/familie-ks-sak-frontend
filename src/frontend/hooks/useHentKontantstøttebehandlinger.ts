import { hentKontantstøtteBehandlinger } from '@api/hentKontantstøtteBehandlinger';
import { queryKeys } from '@hooks/keys/queryKeys';
import { MetaKey } from '@hooks/meta/metaKey';
import type { VisningBehandling } from '@sider/Fagsak/Saksoversikt/visningBehandling';
import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { FagsakId } from '@typer/fagsak';

type Options = Omit<UseQueryOptions<VisningBehandling[]>, 'queryKey' | 'queryFn'>;

export function useHentKontantstøttebehandlinger(fagsakId: FagsakId, options?: Options) {
    return useQuery({
        queryKey: queryKeys.kontantstøttebehandlinger(fagsakId),
        queryFn: () => hentKontantstøtteBehandlinger(fagsakId),
        meta: { [MetaKey.VIS_SYSTEMET_LASTER]: true },
        ...options,
    });
}
