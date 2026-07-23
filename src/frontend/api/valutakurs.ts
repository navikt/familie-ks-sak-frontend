import { apiClient } from '@api/client/apiClient';
import type { IBehandling } from '@typer/behandling';

export interface OppdaterValutakursPayload {
    id: number;
    fom: string;
    tom?: string;
    barnIdenter: string[];
    valutakode?: string;
    valutakursdato?: string;
    kurs?: string;
}

export async function oppdaterValutakurs(payload: OppdaterValutakursPayload, behandlingId: number) {
    return apiClient.put<OppdaterValutakursPayload, IBehandling>({
        data: payload,
        url: `/familie-ks-sak/api/differanseberegning/valutakurs/${behandlingId}`,
    });
}

export async function slettValutakurs(behandlingId: number, valutakursId: number) {
    return apiClient.delete<void, IBehandling>({
        url: `/familie-ks-sak/api/differanseberegning/valutakurs/${behandlingId}/${valutakursId}`,
    });
}
