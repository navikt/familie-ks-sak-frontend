import { apiClient } from '@api/client/apiClient';
import type { Bydel } from '@typer/barnehagebarn';

export async function hentBydeler(): Promise<Bydel[]> {
    return apiClient.get<void, Bydel[]>({
        url: '/familie-ks-sak/api/barnehagebarn/bydeler',
    });
}
