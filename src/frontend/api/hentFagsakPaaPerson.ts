import { apiClient } from '@api/client/apiClient';
import type { IMinimalFagsak } from '@typer/fagsak';

interface Payload {
    ident: string;
}

export async function hentFagsakPaaPerson(payload: Payload): Promise<IMinimalFagsak> {
    return apiClient.post<Payload, IMinimalFagsak>({
        url: `/familie-ks-sak/api/fagsaker/hent-fagsak-paa-person`,
        data: payload,
    });
}
