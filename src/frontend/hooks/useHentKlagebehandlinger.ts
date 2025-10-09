import { useQuery } from '@tanstack/react-query';

import { useHttp } from '@navikt/familie-http';

import { hentKlagebehandlinger } from '../api/hentKlagebehandlinger';

export const HentKlagebehandlingerQueryKeyFactory = {
    klagebehandlinger: (fagsakId: number) => ['klagebehandlinger', fagsakId],
};

export function useHentKlagebehandlinger(fagsakId: number) {
    const { request } = useHttp();
    return useQuery({
        queryKey: HentKlagebehandlingerQueryKeyFactory.klagebehandlinger(fagsakId),
        queryFn: () => hentKlagebehandlinger(request, fagsakId),
    });
}
