import { apiClient } from '@api/client/apiClient';
import type { SlettSammensattKontrollsakDto } from '@typer/sammensatt-kontrollsak';

export async function slettSammensattKontrollsak(payload: SlettSammensattKontrollsakDto): Promise<number> {
    return apiClient.delete<SlettSammensattKontrollsakDto, number>({
        url: '/familie-ks-sak/api/sammensatt-kontrollsak',
        data: payload,
    });
}
