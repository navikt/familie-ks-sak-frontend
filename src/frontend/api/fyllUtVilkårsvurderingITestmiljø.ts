import { apiClient } from '@api/client/apiClient';

export async function fyllUtVilkårsvurderingITestmiljø(behandlingId: number) {
    return apiClient.put<undefined, string>({
        url: `/familie-ks-sak/api/forvaltning/${behandlingId}/fyll-ut-vilkarsvurdering`,
    });
}
