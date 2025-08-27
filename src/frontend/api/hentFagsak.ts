import type { FamilieRequest } from '@navikt/familie-http/dist/HttpProvider';

import type { IMinimalFagsak } from '../typer/fagsak';
import { RessursResolver } from '../utils/ressursResolver';

export async function hentFagsak(
    request: FamilieRequest,
    fagsakId: number,
    påvirkerSystemLaster: boolean = true
): Promise<IMinimalFagsak> {
    const ressurs = await request<void, IMinimalFagsak>({
        method: 'GET',
        url: `/familie-ks-sak/api/fagsaker/minimal/${fagsakId}`,
        påvirkerSystemLaster,
    });
    return RessursResolver.resolveToPromise(ressurs);
}
