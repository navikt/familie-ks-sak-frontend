import type { FamilieRequest } from '@navikt/familie-http/dist/HttpProvider';

import type { Bydel } from '../typer/barnehagebarn';
import { RessursResolver } from '../utils/ressursResolver';

const BYDELER_URL = '/familie-ks-sak/api/barnehagebarn/bydeler';

export async function hentBydeler(request: FamilieRequest): Promise<Bydel[]> {
    const ressurs = await request<void, Bydel[]>({
        method: 'GET',
        url: BYDELER_URL,
    });
    return RessursResolver.resolveToPromise(ressurs);
}
