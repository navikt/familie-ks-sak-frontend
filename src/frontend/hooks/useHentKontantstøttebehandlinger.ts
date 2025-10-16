import { useQuery } from '@tanstack/react-query';

import { useHttp } from '@navikt/familie-http';

import { hentKontantstøtteBehandlinger } from '../api/hentKontantstøtteBehandlinger';

export const HentKontantstøttebehandlingerQueryKeyFactory = {
    kontantstøttebehandlinger: (fagsakId: number) => ['kontantstøttebehandlinger', fagsakId],
};

export function useHentKontantstøttebehandlinger(fagsakId: number, påvirkerSystemLaster: boolean = true) {
    const { request } = useHttp();
    return useQuery({
        queryKey: HentKontantstøttebehandlingerQueryKeyFactory.kontantstøttebehandlinger(fagsakId),
        queryFn: () => hentKontantstøtteBehandlinger(request, fagsakId, påvirkerSystemLaster),
    });
}
