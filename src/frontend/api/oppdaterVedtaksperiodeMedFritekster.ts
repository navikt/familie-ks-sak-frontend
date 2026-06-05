import { apiClient } from '@api/client/apiClient';
import type { IVedtaksperiodeMedBegrunnelser } from '@typer/vedtaksperiode';

export interface Payload {
    fritekster: string[];
}

export async function oppdaterVedtaksperiodeMedFritekster(
    vedtaksperiodeMedBegrunnelserId: number,
    payload: Payload
): Promise<IVedtaksperiodeMedBegrunnelser[]> {
    return apiClient.put<Payload, IVedtaksperiodeMedBegrunnelser[]>({
        url: `/familie-ks-sak/api/vedtaksperioder/fritekster/${vedtaksperiodeMedBegrunnelserId}`,
        data: payload,
    });
}
