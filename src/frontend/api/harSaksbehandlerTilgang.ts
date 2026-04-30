import type { FamilieRequest } from '@navikt/familie-http/dist/HttpProvider';

import type { IRestTilgang } from '../typer/person';
import { RessursResolver } from '../utils/ressursResolver';

export interface HarSaksbehandlerTilgangPayload {
    brukerIdent: string;
}

export async function harSaksbehandlerTilgang(request: FamilieRequest, brukerIdent: string) {
    const ressurs = await request<HarSaksbehandlerTilgangPayload, IRestTilgang>({
        data: { brukerIdent: brukerIdent },
        method: 'POST',
        url: '/familie-ks-sak/api/tilgang',
    });
    return RessursResolver.resolveToPromise(ressurs);
}
