import type { FamilieRequest } from '@navikt/familie-http/dist/HttpProvider';
import type { IRestRefusjonEøs } from '@typer/refusjon-eøs';

import { RessursResolver } from '../utils/ressursResolver';

export async function slettRefusjonEøs(request: FamilieRequest, behandlingId: number, refusjonEøsId: number) {
    const ressurs = await request<null, IRestRefusjonEøs[]>({
        method: 'DELETE',
        url: `/familie-ks-sak/api/refusjon-eøs/behandlinger/${behandlingId}/perioder/${refusjonEøsId}`,
    });
    return RessursResolver.resolveToPromise(ressurs);
}
