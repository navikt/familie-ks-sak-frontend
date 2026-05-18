import type { IBehandling } from '@typer/behandling';
import type { Begrunnelse } from '@typer/vedtak';

import type { FamilieRequest } from '@navikt/familie-http/dist/HttpProvider';

import { RessursResolver } from '../utils/ressursResolver';

interface Payload {
    begrunnelser: Begrunnelse[];
}

export async function oppdaterVedtaksperiodeMedBegrunnelser(
    request: FamilieRequest,
    vedtaksperiodeMedBegrunnelserId: number,
    payload: Payload
) {
    const ressurs = await request<Payload, IBehandling>({
        method: 'PUT',
        url: `/familie-ks-sak/api/vedtaksperioder/begrunnelser/${vedtaksperiodeMedBegrunnelserId}`,
        data: payload,
    });
    return RessursResolver.resolveToPromise(ressurs);
}
