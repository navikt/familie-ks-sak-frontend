import { apiClient } from '@api/client/apiClient';
import type { IManueltBrevRequestPåFagsak } from '@typer/dokument';

export async function forhåndsvisBrevPåFagsak(fagsakId: number, payload: IManueltBrevRequestPåFagsak): Promise<string> {
    return apiClient.post<IManueltBrevRequestPåFagsak, string>({
        url: `/familie-ks-sak/api/brev/fagsak/${fagsakId}/forhaandsvis-brev`,
        data: payload,
    });
}
