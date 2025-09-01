import type { FamilieRequest } from '@navikt/familie-http/dist/HttpProvider';

import type { IMinimalFagsak } from '../typer/fagsak';
import { RessursResolver } from '../utils/ressursResolver';

export interface OpprettFagsakPayload {
    personIdent: string;
}

export async function opprettFagsak(request: FamilieRequest, payload: OpprettFagsakPayload) {
    const ressurs = await request<OpprettFagsakPayload, IMinimalFagsak>({
        data: payload,
        method: 'POST',
        url: `/familie-ks-sak/api/fagsaker`,
        påvirkerSystemLaster: true,
    });
    return RessursResolver.resolveToPromise(ressurs);
}
