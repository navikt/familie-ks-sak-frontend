import type { FamilieRequest } from '@navikt/familie-http/dist/HttpProvider';

import { RessursResolver } from '../utils/ressursResolver';

export interface OpprettForhåndsvisTilbakekrevingVarselbrevRequest {
    fritekst: string;
}

export async function opprettForhåndsvisbarTilbakekrevingVarselbrev(
    request: FamilieRequest,
    behandlingId: number,
    payload: OpprettForhåndsvisTilbakekrevingVarselbrevRequest
) {
    const ressurs = await request<OpprettForhåndsvisTilbakekrevingVarselbrevRequest, string>({
        method: 'POST',
        url: `/familie-ks-sak/api/tilbakekreving/${behandlingId}/forhaandsvis-tilbakekreving-varselbrev`,
        data: { fritekst: payload.fritekst },
        påvirkerSystemLaster: false,
    });
    return RessursResolver.resolveToPromise(ressurs);
}
