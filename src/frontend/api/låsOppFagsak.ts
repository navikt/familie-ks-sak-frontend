import { apiClient } from '@api/client/apiClient';
import type { FagsakId, IMinimalFagsak } from '@typer/fagsak';

export interface LåsOppFagsakPayload {
    begrunnelse: string;
}

export async function låsOppFagsak(fagsakId: FagsakId, payload: LåsOppFagsakPayload) {
    return apiClient.patch<LåsOppFagsakPayload, IMinimalFagsak>({
        data: payload,
        url: `/familie-ks-sak/api/fagsaker/${fagsakId}/laas-opp`,
    });
}
