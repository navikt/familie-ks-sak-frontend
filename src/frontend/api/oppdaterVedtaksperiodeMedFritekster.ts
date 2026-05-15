import type { IBehandling } from '@typer/behandling';

import type { FamilieRequest } from '@navikt/familie-http/dist/HttpProvider';

import { RessursResolver } from '../utils/ressursResolver';

export interface Payload {
    fritekster: string[];
}

export async function oppdaterVedtaksperiodeMedFritekster(
    request: FamilieRequest,
    vedtaksperiodeMedBegrunnelserId: number,
    payload: Payload
) {
    const ressurs = await request<Payload, IBehandling>({
        method: 'PUT',
        url: `/familie-ks-sak/api/vedtaksperioder/fritekster/${vedtaksperiodeMedBegrunnelserId}`,
        data: payload,
    });
    return RessursResolver.resolveToPromise(ressurs);
}
