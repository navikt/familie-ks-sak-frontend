import { hentSammensattKontrollsak } from '@api/hentSammensattKontrollsak';
import { MetaKey } from '@hooks/meta/metaKey';
import { useQuery } from '@tanstack/react-query';

export const HentSammensattKontrollsakQueryKeyFactory = {
    behandling: (behandlingId: number) => ['sammensatt-kontrollsak', behandlingId],
};

export function useHentSammensattKontrollsak(behandlingId: number) {
    return useQuery({
        queryKey: HentSammensattKontrollsakQueryKeyFactory.behandling(behandlingId),
        queryFn: () => hentSammensattKontrollsak(behandlingId),
        meta: { [MetaKey.VIS_SYSTEMET_LASTER]: true },
    });
}
