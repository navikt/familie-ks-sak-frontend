import { hentTilbakekrevingsbehandlinger } from '@api/hentTilbakekrevingsbehandlinger';
import { MetaKey } from '@hooks/meta/metaKey';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { ITilbakekrevingsbehandling } from '@typer/tilbakekrevingsbehandling';

type Options = Omit<UseQueryOptions<ITilbakekrevingsbehandling[]>, 'queryKey' | 'queryFn'>;

export const HentTilbakekrevingsbehandlingerQueryKeyFactory = {
    tilbakekrevingsbehandlinger: (fagsakId: number) => ['tilbakekrevingsbehandlinger', fagsakId],
};

export function useHentTilbakekrevingsbehandlinger(fagsakId: number, options?: Options) {
    return useQuery({
        queryKey: HentTilbakekrevingsbehandlingerQueryKeyFactory.tilbakekrevingsbehandlinger(fagsakId),
        queryFn: () => hentTilbakekrevingsbehandlinger(fagsakId),
        meta: { [MetaKey.VIS_SYSTEMET_LASTER]: true },
        ...options,
    });
}
