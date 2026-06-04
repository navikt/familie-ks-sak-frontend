import { apiClient } from '@api/client/apiClient';
import type { IMinimalFagsak } from '@typer/fagsak';

interface Payload {
    aktørId: string;
}

export async function opprettEllerHentFagsak(payload: Payload): Promise<IMinimalFagsak> {
    return apiClient.post<Payload, IMinimalFagsak>({
        url: `/familie-ks-sak/api/fagsaker`,
        data: payload,
    });
}
