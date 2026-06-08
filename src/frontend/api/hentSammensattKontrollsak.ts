import { apiClient } from '@api/client/apiClient';
import type { SammensattKontrollsakDto } from '@typer/sammensatt-kontrollsak';

export async function hentSammensattKontrollsak(behandlingId: number): Promise<SammensattKontrollsakDto | null> {
    return apiClient.get<void, SammensattKontrollsakDto | null>({
        url: `/familie-ks-sak/api/sammensatt-kontrollsak/${behandlingId}`,
    });
}
