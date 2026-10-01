import { apiClient } from '@api/client/apiClient';
import type { IBehandling } from '@typer/behandling';

export async function slettEndretUtbetalingAndel(
    behandlingId: number,
    endretUtbetalingAndelId: number
): Promise<IBehandling> {
    return apiClient.delete<undefined, IBehandling>({
        url: `/familie-ks-sak/api/endretutbetalingandel/${behandlingId}/${endretUtbetalingAndelId}`,
    });
}
