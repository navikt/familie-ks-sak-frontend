import { apiClient } from '@api/client/apiClient';
import type { IBehandling } from '@typer/behandling';
import type { IRestAnnenVurdering } from '@typer/vilkår';

export async function oppdaterAnnenVurdering(behandlingId: number, payload: IRestAnnenVurdering) {
    return apiClient.put<IRestAnnenVurdering, IBehandling>({
        url: `/familie-ks-sak/api/vilkårsvurdering/${behandlingId}/annenvurdering`,
        data: payload,
    });
}
