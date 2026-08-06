import { apiClient } from '@api/client/apiClient';

export interface OpprettTilbakekrevingPayload {
    fagsakId: number;
}

export async function opprettTilbakekreving(payload: OpprettTilbakekrevingPayload) {
    return apiClient.post<OpprettTilbakekrevingPayload, void>({
        data: payload,
        url: `/familie-ks-sak/api/tilbakekreving/manuell`,
    });
}
