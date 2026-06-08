import { apiClient } from '@api/client/apiClient';
import type { OpprettSammensattKontrollsakDto, SammensattKontrollsakDto } from '@typer/sammensatt-kontrollsak';

export async function opprettSammensattKontrollsak(
    payload: OpprettSammensattKontrollsakDto
): Promise<SammensattKontrollsakDto> {
    return apiClient.post<OpprettSammensattKontrollsakDto, SammensattKontrollsakDto>({
        url: '/familie-ks-sak/api/sammensatt-kontrollsak',
        data: payload,
    });
}
