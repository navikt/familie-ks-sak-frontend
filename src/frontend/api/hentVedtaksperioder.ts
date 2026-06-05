import { apiClient } from '@api/client/apiClient';
import type { IVedtaksperiodeMedBegrunnelser } from '@typer/vedtaksperiode';

export async function hentVedtaksperioder(behandlingId: number): Promise<IVedtaksperiodeMedBegrunnelser[]> {
    return apiClient.get<void, IVedtaksperiodeMedBegrunnelser[]>({
        url: `/familie-ks-sak/api/vedtaksperioder/behandling/${behandlingId}/hent-vedtaksperioder`,
    });
}
