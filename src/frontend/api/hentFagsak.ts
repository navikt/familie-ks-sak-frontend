import { apiClient } from '@api/client/apiClient';
import type { FagsakId, IMinimalFagsak } from '@typer/fagsak';

export async function hentFagsak(fagsakId: FagsakId): Promise<IMinimalFagsak> {
    return apiClient.get<void, IMinimalFagsak>({
        url: `/familie-ks-sak/api/fagsaker/minimal/${fagsakId}`,
    });
}
