import { apiClient } from '@api/client/apiClient';
import type { OppdaterSammensattKontrollsakDto, SammensattKontrollsakDto } from '@typer/sammensatt-kontrollsak';

export async function oppdaterSammensattKontrollsak(
    payload: OppdaterSammensattKontrollsakDto
): Promise<SammensattKontrollsakDto> {
    return apiClient.put<OppdaterSammensattKontrollsakDto, SammensattKontrollsakDto>({
        url: '/familie-ks-sak/api/sammensatt-kontrollsak',
        data: payload,
    });
}
