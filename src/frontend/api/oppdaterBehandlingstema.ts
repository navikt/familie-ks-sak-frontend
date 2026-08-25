import { apiClient } from '@api/client/apiClient';
import type { IBehandling } from '@typer/behandling';
import type { BehandlingKategori } from '@typer/behandlingstema';

export interface OppdaterBehandlingstemaPayload {
    behandlingKategori: BehandlingKategori;
}

export async function oppdaterBehandlingstema(payload: OppdaterBehandlingstemaPayload, behandlingId: number) {
    return apiClient.put<OppdaterBehandlingstemaPayload, IBehandling>({
        data: payload,
        url: `/familie-ks-sak/api/behandlinger/${behandlingId}/behandlingstema`,
    });
}
