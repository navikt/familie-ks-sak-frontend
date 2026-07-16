import { apiClient } from '@api/client/apiClient';
import type { IBehandling } from '@typer/behandling';

export async function opprettEndretUtbetalingAndel(behandlingId: number): Promise<IBehandling> {
    return apiClient.post<Record<string, never>, IBehandling>({
        data: {},
        url: `/familie-ks-sak/api/endretutbetalingandel/${behandlingId}`,
    });
}
