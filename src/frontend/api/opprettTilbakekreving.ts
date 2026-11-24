import { apiClient } from '@api/client/apiClient';
import type { FagsakId } from '@typer/fagsak';

export interface OpprettTilbakekrevingPayload {
    fagsakId: FagsakId;
}

export async function opprettTilbakekreving(payload: OpprettTilbakekrevingPayload) {
    return apiClient.post<OpprettTilbakekrevingPayload, void>({
        data: payload,
        url: `/familie-ks-sak/api/tilbakekreving/manuell`,
    });
}
