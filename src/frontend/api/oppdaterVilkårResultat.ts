import { apiClient } from '@api/client/apiClient';
import type { IBehandling } from '@typer/behandling';
import type { IEndreVilkårResultat } from '@typer/vilkår';

export async function oppdaterVilkårResultat(behandlingId: number, payload: IEndreVilkårResultat) {
    return apiClient.put<IEndreVilkårResultat, IBehandling>({
        url: `/familie-ks-sak/api/vilkårsvurdering/${behandlingId}`,
        data: payload,
    });
}
