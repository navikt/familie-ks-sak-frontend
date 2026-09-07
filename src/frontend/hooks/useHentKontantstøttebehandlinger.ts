import { hentKontantstøtteBehandlinger } from '@api/hentKontantstøtteBehandlinger';
import { MetaKey } from '@hooks/meta/metaKey';
import type { VisningBehandling } from '@sider/Fagsak/Saksoversikt/visningBehandling';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

type Options = Omit<UseQueryOptions<VisningBehandling[]>, 'queryKey' | 'queryFn'>;

export const HentKontantstøttebehandlingerQueryKeyFactory = {
    kontantstøttebehandlinger: (fagsakId: number) => ['kontantstøttebehandlinger', fagsakId],
};

export function useHentKontantstøttebehandlinger(fagsakId: number, options?: Options) {
    return useQuery({
        queryKey: HentKontantstøttebehandlingerQueryKeyFactory.kontantstøttebehandlinger(fagsakId),
        queryFn: () => hentKontantstøtteBehandlinger(fagsakId),
        meta: { [MetaKey.VIS_SYSTEMET_LASTER]: true },
        ...options,
    });
}
