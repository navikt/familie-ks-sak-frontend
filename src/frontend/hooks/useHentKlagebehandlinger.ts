import { hentKlagebehandlinger } from '@api/hentKlagebehandlinger';
import { MetaKey } from '@hooks/meta/metaKey';
import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { IKlagebehandling } from '@typer/klage';

type Options = Omit<UseQueryOptions<IKlagebehandling[]>, 'queryKey' | 'queryFn'>;

export const HentKlagebehandlingerQueryKeyFactory = {
    klagebehandlinger: (fagsakId: number) => ['klagebehandlinger', fagsakId],
};

export function useHentKlagebehandlinger(fagsakId: number, options?: Options) {
    return useQuery({
        queryKey: HentKlagebehandlingerQueryKeyFactory.klagebehandlinger(fagsakId),
        queryFn: () => hentKlagebehandlinger(fagsakId),
        meta: { [MetaKey.VIS_SYSTEMET_LASTER]: true },
        ...options,
    });
}
