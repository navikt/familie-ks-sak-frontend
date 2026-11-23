import type { FamilieRequest } from '@navikt/familie-http/dist/HttpProvider';
import type { IRestFeilutbetaltValuta } from '@typer/eøs-feilutbetalt-valuta';

import { RessursResolver } from '../utils/ressursResolver';

export interface OpprettFeilutbetaltValutaPayload {
    fom: string;
    tom: string;
    feilutbetaltBeløp: number;
}

export async function opprettFeilutbetaltValuta(
    request: FamilieRequest,
    behandlingId: number,
    payload: OpprettFeilutbetaltValutaPayload
) {
    const ressurs = await request<OpprettFeilutbetaltValutaPayload, IRestFeilutbetaltValuta[]>({
        method: 'POST',
        url: `/familie-ks-sak/api/feilutbetalt-valuta/behandlinger/${behandlingId}`,
        data: payload,
    });
    return RessursResolver.resolveToPromise(ressurs);
}
