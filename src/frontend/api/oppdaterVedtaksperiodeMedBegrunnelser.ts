import { apiClient } from '@api/client/apiClient';
import type { Begrunnelse } from '@typer/vedtak';
import type { IVedtaksperiodeMedBegrunnelser } from '@typer/vedtaksperiode';

interface Payload {
    begrunnelser: Begrunnelse[];
}

export async function oppdaterVedtaksperiodeMedBegrunnelser(
    vedtaksperiodeMedBegrunnelserId: number,
    payload: Payload
): Promise<IVedtaksperiodeMedBegrunnelser[]> {
    return apiClient.put<Payload, IVedtaksperiodeMedBegrunnelser[]>({
        url: `/familie-ks-sak/api/vedtaksperioder/begrunnelser/${vedtaksperiodeMedBegrunnelserId}`,
        data: payload,
    });
}
