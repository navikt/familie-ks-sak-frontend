import type { FamilieRequest } from '@navikt/familie-http/dist/HttpProvider';

import type { VisningBehandling } from '../sider/Fagsak/Saksoversikt/visningBehandling';
import { RessursResolver } from '../utils/ressursResolver';

export async function hentKontantstøtteBehandlinger(
    request: FamilieRequest,
    fagsakId: number,
    påvirkerSystemLaster: boolean = true
): Promise<VisningBehandling[]> {
    const ressurs = await request<void, VisningBehandling[]>({
        method: 'GET',
        url: `/familie-ks-sak/api/behandlinger/fagsak/${fagsakId}`,
        påvirkerSystemLaster,
    });
    return RessursResolver.resolveToPromise(ressurs);
}
