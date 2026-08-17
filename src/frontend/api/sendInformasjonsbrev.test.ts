import { apiClient } from '@api/client/apiClient';
import { sendInformasjonsbrev } from '@api/sendInformasjonsbrev';
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

describe('sendInformasjonsbrev', () => {
    test('skal sende forespørsel om å sende informasjonsbrev', async () => {
        const payload: IManueltBrevRequestPåFagsak = {
            mottakerIdent: '12345678903',
            mottakerNavn: 'Test Testersen',
            mottakerMålform: Målform.NB,
            multiselectVerdier: [],
            barnIBrev: [],
            brevmal: Informasjonsbrev.INFORMASJONSBREV_KAN_SØKE_EØS,
            manuelleBrevmottakere: [],
        };

        vi.mocked(apiClient.post).mockResolvedValueOnce(undefined);

        await sendInformasjonsbrev(1, payload);

        expect(apiClient.post).toHaveBeenCalledTimes(1);
        expect(apiClient.post).toHaveBeenCalledWith({
            url: '/familie-ks-sak/api/brev/fagsak/1/send-brev',
            data: payload,
        });
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

        await expect(sendInformasjonsbrev(1, payload)).rejects.toThrow('Noe gikk galt');
    });
});
