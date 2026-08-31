import { apiClient } from '@api/client/apiClient';

export async function hentHarÅpenTilbakekreving(fagsakId: number): Promise<boolean> {
    return apiClient.get<void, boolean>({
        url: `/familie-ks-sak/api/fagsaker/${fagsakId}/har-åpen-tilbakekrevingsbehandling`,
    });
}
