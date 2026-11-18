import { hentSammensattKontrollsak } from '@api/hentSammensattKontrollsak';
import { queryKeys } from '@hooks/keys/queryKeys';
import { MetaKey } from '@hooks/meta/metaKey';
import { useQuery } from '@tanstack/react-query';

export function useHentSammensattKontrollsak(behandlingId: number) {
    return useQuery({
        queryKey: queryKeys.sammensattKontrollsak(behandlingId),
        queryFn: () => hentSammensattKontrollsak(behandlingId),
        meta: { [MetaKey.VIS_SYSTEMET_LASTER]: true },
    });
}
