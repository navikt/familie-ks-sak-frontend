import type { FamilieRequest } from '@navikt/familie-http/dist/HttpProvider';
import type { IRestFeilutbetaltValuta } from '@typer/eøs-feilutbetalt-valuta';

import { RessursResolver } from '../utils/ressursResolver';

export async function slettFeilutbetaltValuta(
    request: FamilieRequest,
    behandlingId: number,
    feilutbetaltValutaId: number
) {
    const ressurs = await request<null, IRestFeilutbetaltValuta[]>({
        method: 'DELETE',
        url: `/familie-ks-sak/api/feilutbetalt-valuta/behandlinger/${behandlingId}/${feilutbetaltValutaId}`,
    });
    return RessursResolver.resolveToPromise(ressurs);
}
