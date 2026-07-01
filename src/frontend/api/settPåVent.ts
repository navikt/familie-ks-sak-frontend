import { apiClient } from '@api/client/apiClient';
import type { IBehandling, SettPåVentÅrsak } from '@typer/behandling';
import type { IsoDatoString } from '@utils/dato';

export interface SettPåVentPayload {
    frist: IsoDatoString;
    årsak: SettPåVentÅrsak;
}

export async function settPåVent(
    behandlingId: number,
    payload: SettPåVentPayload,
    erBehandlingAlleredePåVent: boolean
): Promise<IBehandling> {
    return apiClient.request<SettPåVentPayload, IBehandling>({
        method: erBehandlingAlleredePåVent ? 'PUT' : 'POST',
        url: erBehandlingAlleredePåVent
            ? `/familie-ks-sak/api/behandlinger/${behandlingId}/sett-på-vent/oppdater`
            : `/familie-ks-sak/api/behandlinger/${behandlingId}/sett-på-vent`,
        data: payload,
    });
}
