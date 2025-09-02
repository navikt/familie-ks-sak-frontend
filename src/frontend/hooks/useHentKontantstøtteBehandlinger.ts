import { useQuery } from '@tanstack/react-query';

import { useHttp } from '@navikt/familie-http';

import { hentKontantstøtteBehandlinger } from '../api/hentKontantstøtteBehandlinger';

export const HentBehandlingerQueryKeyFactory = {
    fagsak: (fagsakId: number | undefined) => ['visningsBehandlinger', fagsakId],
};

export function useHentKontantstøtteBehandlinger(
    fagsakId: number | undefined,
    påvirkerSystemLaster: boolean = true
) {
    const { request } = useHttp();
    return useQuery({
        queryKey: HentBehandlingerQueryKeyFactory.fagsak(fagsakId),
        queryFn: () => {
            if (fagsakId === undefined) {
                return Promise.reject(new Error('Kan ikke hente fagsak uten fagsakId.'));
            }
            return hentKontantstøtteBehandlinger(request, fagsakId, påvirkerSystemLaster);
        },
        enabled: fagsakId !== undefined,
    });
}
