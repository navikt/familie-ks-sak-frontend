import { apiClient } from '@api/client/apiClient';
import type { VisningBehandling } from '@sider/Fagsak/Saksoversikt/visningBehandling';

export async function hentKontantstøtteBehandlinger(fagsakId: number): Promise<VisningBehandling[]> {
    return apiClient.get<void, VisningBehandling[]>({
        url: `/familie-ks-sak/api/behandlinger/fagsak/${fagsakId}`,
    });
}
