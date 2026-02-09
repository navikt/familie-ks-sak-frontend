import type { FamilieRequest } from '@navikt/familie-http/dist/HttpProvider';

import { RessursResolver } from '../utils/ressursResolver';

export async function hentGenererteBrevbegrunnelser(
    request: FamilieRequest,
    vedtaksperiodeId: number
): Promise<string[]> {
    const ressurs = await request<void, string[]>({
        method: 'GET',
        url: `/familie-ks-sak/api/vedtaksperioder/${vedtaksperiodeId}/brevbegrunnelser`,
    });
    return RessursResolver.resolveToPromise(ressurs);
}
