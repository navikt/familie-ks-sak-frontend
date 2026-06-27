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
    if (erBehandlingAlleredePåVent) {
        return apiClient.put<SettPåVentPayload, IBehandling>({
            url: `/familie-ks-sak/api/behandlinger/${behandlingId}/sett-på-vent/oppdater`,
            data: payload,
        });
    }
    return apiClient.post<SettPåVentPayload, IBehandling>({
        url: `/familie-ks-sak/api/behandlinger/${behandlingId}/sett-på-vent`,
        data: payload,
    });
}
