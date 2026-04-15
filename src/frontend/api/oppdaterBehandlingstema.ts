import type { FamilieRequest } from '@navikt/familie-http/dist/HttpProvider';

import type { IBehandling } from '../typer/behandling';
import type { BehandlingKategori } from '../typer/behandlingstema';
import { RessursResolver } from '../utils/ressursResolver';

export interface OppdaterBehandlingstemaPayload {
    behandlingKategori: BehandlingKategori;
}

export const oppdaterBehandlingstema = async (
    request: FamilieRequest,
    behandlingKategori: BehandlingKategori,
    behandlingId: number
) => {
    const ressurs = await request<OppdaterBehandlingstemaPayload, IBehandling>({
        data: {
            behandlingKategori: behandlingKategori,
        },
        method: 'PUT',
        url: `/familie-ks-sak/api/behandlinger/${behandlingId}/behandlingstema`,
    });
    return RessursResolver.resolveToPromise(ressurs);
};
