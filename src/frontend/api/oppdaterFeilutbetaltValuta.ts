import type { FamilieRequest } from '@navikt/familie-http/dist/HttpProvider';
import type { IRestFeilutbetaltValuta } from '@typer/eøs-feilutbetalt-valuta';

import { RessursResolver } from '../utils/ressursResolver';

export interface OppdaterFeilutbetaltValutaPayload {
    fom: string;
    tom: string;
    feilutbetaltBeløp: number;
}

export async function oppdaterFeilutbetaltValuta(
    request: FamilieRequest,
    behandlingId: number,
    feilutbetaltValutaId: number,
    payload: OppdaterFeilutbetaltValutaPayload
) {
    const ressurs = await request<OppdaterFeilutbetaltValutaPayload, IRestFeilutbetaltValuta[]>({
        method: 'PUT',
        url: `/familie-ks-sak/api/feilutbetalt-valuta/behandlinger/${behandlingId}/${feilutbetaltValutaId}`,
        data: payload,
    });
    return RessursResolver.resolveToPromise(ressurs);
}
