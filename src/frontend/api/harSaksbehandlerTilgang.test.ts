import { apiClient } from '@api/client/apiClient';
import { harSaksbehandlerTilgang, type HarSaksbehandlerTilgangPayload } from '@api/harSaksbehandlerTilgang';
import { Adressebeskyttelsegradering, type IRestTilgang } from '@typer/person';
import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('@api/client/apiClient', () => ({
    apiClient: {
        post: vi.fn(),
    },
}));

afterEach(() => {
    vi.clearAllMocks();
});

const payload: HarSaksbehandlerTilgangPayload = {
    brukerIdent: 'Z123456',
};

describe('harSaksbehandlerTilgang', () => {
    test('skal sende forespørsel om saksbehandlertilgang', async () => {
        const tilgang: IRestTilgang = {
            saksbehandlerHarTilgang: true,
            adressebeskyttelsegradering: Adressebeskyttelsegradering.UGRADERT,
        };
        vi.mocked(apiClient.post).mockResolvedValueOnce(tilgang);

        const svar = await harSaksbehandlerTilgang(payload);

        expect(apiClient.post).toHaveBeenCalledTimes(1);
        expect(apiClient.post).toHaveBeenCalledWith({
            data: payload,
            url: '/familie-ks-sak/api/tilgang',
        });
        expect(svar).toEqual(tilgang);
    });

    test('skal håndtere feil', async () => {
        vi.mocked(apiClient.post).mockRejectedValue(new Error('Noe gikk galt'));

        await expect(harSaksbehandlerTilgang(payload)).rejects.toThrow('Noe gikk galt');
    });
});
