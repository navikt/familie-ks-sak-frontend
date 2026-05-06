import type { IMinimalFagsak } from '@typer/fagsak';

import type { FamilieRequest } from '@navikt/familie-http/dist/HttpProvider';

import { RessursResolver } from '../utils/ressursResolver';

interface Payload {
    aktørId: string;
}

export async function opprettEllerHentFagsak(request: FamilieRequest, payload: Payload): Promise<IMinimalFagsak> {
    const ressurs = await request<Payload, IMinimalFagsak>({
        method: 'POST',
        url: `/familie-ks-sak/api/fagsaker`,
        data: payload,
        påvirkerSystemLaster: true,
    });
    return RessursResolver.resolveToPromise(ressurs);
}
