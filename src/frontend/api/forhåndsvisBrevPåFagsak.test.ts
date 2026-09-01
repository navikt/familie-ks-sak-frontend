import { apiClient } from '@api/client/apiClient';
import { forhåndsvisBrevPåFagsak } from '@api/forhåndsvisBrevPåFagsak';
import type { IManueltBrevRequestPåFagsak } from '@typer/dokument';
import { Målform } from '@typer/søknad';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { Informasjonsbrev } from '../sider/Fagsak/Behandling/Høyremeny/Brev/typer';

vi.mock('@api/client/apiClient', () => ({
    apiClient: {
        post: vi.fn(),
    },
}));

afterEach(() => {
    vi.clearAllMocks();
});

describe('forhåndsvisBrevPåFagsak', () => {
    test('skal sende forespørsel om forhåndsvisning av brev på fagsak', async () => {
        const payload: IManueltBrevRequestPåFagsak = {
            mottakerIdent: '12345678903',
            mottakerNavn: 'Test Testersen',
            mottakerMålform: Målform.NB,
            multiselectVerdier: [],
            barnIBrev: [],
            brevmal: Informasjonsbrev.INFORMASJONSBREV_KAN_SØKE_EØS,
            manuelleBrevmottakere: [],
        };

        vi.mocked(apiClient.post).mockResolvedValueOnce('base64==');

        const svar = await forhåndsvisBrevPåFagsak(1, payload);

        expect(apiClient.post).toHaveBeenCalledTimes(1);
        expect(apiClient.post).toHaveBeenCalledWith({
            url: '/familie-ks-sak/api/brev/fagsak/1/forhaandsvis-brev',
            data: payload,
        });
        expect(svar).toEqual('base64==');
    });

    test('skal håndtere feil', async () => {
        vi.mocked(apiClient.post).mockRejectedValue(new Error('Noe gikk galt'));

        const payload: IManueltBrevRequestPåFagsak = {
            mottakerIdent: '12345678903',
            mottakerNavn: 'Test Testersen',
            mottakerMålform: Målform.NB,
            multiselectVerdier: [],
            barnIBrev: [],
            brevmal: Informasjonsbrev.INFORMASJONSBREV_KAN_SØKE_EØS,
            manuelleBrevmottakere: [],
        };

        await expect(forhåndsvisBrevPåFagsak(1, payload)).rejects.toThrow('Noe gikk galt');
    });
});
