import type { FamilieRequest } from '@navikt/familie-http/dist/HttpProvider';

import type { IBehandling } from '../typer/behandling';
import { RessursResolver } from '../utils/ressursResolver';

export interface LeggTilBarnPåBehandlingPayload {
    barnIdent: string;
}

export async function leggTilBarnPåBehandling(request: FamilieRequest, barnIdent: string, behandlingId: number) {
    const ressurs = await request<LeggTilBarnPåBehandlingPayload, IBehandling>({
        data: { barnIdent: barnIdent },
        method: 'POST',
        url: `/familie-ks-sak/api/behandlinger/${behandlingId}/legg-til-barn`,
    });
    return RessursResolver.resolveToPromise(ressurs);
}
