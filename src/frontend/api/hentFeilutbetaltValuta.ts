import { apiClient } from '@api/client/apiClient';
import type { IRestFeilutbetaltValuta } from '@typer/eøs-feilutbetalt-valuta';

export async function hentFeilutbetaltValuta(behandlingId: number): Promise<IRestFeilutbetaltValuta[]> {
    return apiClient.get<void, IRestFeilutbetaltValuta[]>({
        url: `/familie-ks-sak/api/feilutbetalt-valuta/behandlinger/${behandlingId}`,
    });
}
