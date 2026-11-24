import type { FamilieRequest } from '@navikt/familie-http/dist/HttpProvider';
import type { IRestRefusjonEøs } from '@typer/refusjon-eøs';

import { RessursResolver } from '../utils/ressursResolver';

export interface OpprettRefusjonEøsPayload {
    fom: string;
    tom: string;
    refusjonsbeløp: number;
    land: string;
    refusjonAvklart: boolean;
}

export async function opprettRefusjonEøs(
    request: FamilieRequest,
    behandlingId: number,
    payload: OpprettRefusjonEøsPayload
) {
    const ressurs = await request<OpprettRefusjonEøsPayload, IRestRefusjonEøs[]>({
        method: 'POST',
        url: `/familie-ks-sak/api/refusjon-eøs/behandlinger/${behandlingId}`,
        data: payload,
    });
    return RessursResolver.resolveToPromise(ressurs);
}
