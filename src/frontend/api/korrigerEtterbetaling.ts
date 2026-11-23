import type { FamilieRequest } from '@navikt/familie-http/dist/HttpProvider';

import type { IRestKorrigertEtterbetaling } from '../typer/vedtak';
import { RessursResolver } from '../utils/ressursResolver';

export interface KorrigerEtterbetalingPayload {
    årsak: string;
    beløp: number;
    begrunnelse: string;
}

export async function korrigerEtterbetaling(
    request: FamilieRequest,
    payload: KorrigerEtterbetalingPayload,
    behandlingId: number
) {
    const ressurs = await request<KorrigerEtterbetalingPayload, IRestKorrigertEtterbetaling>({
        data: payload,
        method: 'POST',
        url: `/familie-ks-sak/api/korrigertetterbetaling/behandling/${behandlingId}`,
    });
    return RessursResolver.resolveToPromise(ressurs);
}
