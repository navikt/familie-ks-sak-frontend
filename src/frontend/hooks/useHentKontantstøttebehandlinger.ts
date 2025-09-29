import { useQuery } from '@tanstack/react-query';

import { useHttp } from '@navikt/familie-http';

import { hentKontantstøtteBehandlinger } from '../api/hentKontantstøtteBehandlinger';

export const HentKontantstøttebehandlingerQueryKeyFactory = {
    // TODO : Fjern "undefined" når FagsakContext alltid inneholder en fagsak
    kontantstøttebehandlinger: (fagsakId: number | undefined) => ['kontantstøttebehandlinger', fagsakId],
};

export function useHentKontantstøttebehandlinger(fagsakId: number | undefined, påvirkerSystemLaster: boolean = true) {
    const { request } = useHttp();
    return useQuery({
        queryKey: HentKontantstøttebehandlingerQueryKeyFactory.kontantstøttebehandlinger(fagsakId),
        queryFn: () => {
            if (fagsakId === undefined) {
                return Promise.reject(new Error('Kan ikke hente fagsak uten fagsakId.'));
            }
            return hentKontantstøtteBehandlinger(request, fagsakId, påvirkerSystemLaster);
        },
        enabled: fagsakId !== undefined,
    });
}
