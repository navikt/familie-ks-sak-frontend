import { apiClient } from '@api/client/apiClient';
import type { IBehandling } from '@typer/behandling';

export interface OpprettTilbakekrevingPayload {
    fagsakId: number;
}

export async function opprettTilbakekreving(payload: OpprettTilbakekrevingPayload) {
    return apiClient.post<OpprettTilbakekrevingPayload, IBehandling>({
        data: payload,
        url: `/familie-ks-sak/api/tilbakekreving/manuell`,
    });
}
