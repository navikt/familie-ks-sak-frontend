import type { FamilieRequest } from '@navikt/familie-http/dist/HttpProvider';

import type { BarnehagebarnRequestParams, BarnehagebarnResponse } from '../typer/barnehagebarn';
import { RessursResolver } from '../utils/ressursResolver';

const BARNEHAGELISTE_URL = '/familie-ks-sak/api/barnehagebarn/barnehagebarnliste';

export async function hentBarnehagebarn(
    request: FamilieRequest,
    barnehagebarnRequestParams: BarnehagebarnRequestParams
): Promise<BarnehagebarnResponse> {
    const ressurs = await request<BarnehagebarnRequestParams, BarnehagebarnResponse>({
        data: barnehagebarnRequestParams,
        method: 'POST',
        url: `${BARNEHAGELISTE_URL}`,
    });
    return RessursResolver.resolveToPromise(ressurs);
}
