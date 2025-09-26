import { useQuery } from '@tanstack/react-query';

import { useHttp } from '@navikt/familie-http';

import { hentTilbakekrevingsbehandlinger } from '../api/hentTilbakekrevingsbehandlinger';

export const HentTilbakekrevingsbehandlingerQueryKeyFactory = {
    // TODO : Fjern "undefined" når FagsakContext alltid inneholder en fagsak
    tilbakekrevingsbehandlinger: (fagsakId: number | undefined) => ['tilbakekrevingsbehandlinger', fagsakId],
};

export function useHentTilbakekrevingsbehandlinger(fagsakId: number) {
    const { request } = useHttp();
    return useQuery({
        queryKey: HentTilbakekrevingsbehandlingerQueryKeyFactory.tilbakekrevingsbehandlinger(fagsakId),
        queryFn: () => hentTilbakekrevingsbehandlinger(request, fagsakId),
    });
}
