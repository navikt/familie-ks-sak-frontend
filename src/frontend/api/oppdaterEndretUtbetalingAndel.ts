import { apiClient } from '@api/client/apiClient';
import type { IBehandling } from '@typer/behandling';
import type { IRestEndretUtbetalingAndel } from '@typer/utbetalingAndel';

export async function oppdaterEndretUtbetalingAndel(
    behandlingId: number,
    endretUtbetalingAndelId: number,
    payload: IRestEndretUtbetalingAndel
): Promise<IBehandling> {
    return apiClient.put<IRestEndretUtbetalingAndel, IBehandling>({
        data: payload,
        url: `/familie-ks-sak/api/endretutbetalingandel/${behandlingId}/${endretUtbetalingAndelId}`,
    });
}
