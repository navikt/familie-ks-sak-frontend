import { apiClient } from '@api/client/apiClient';
import { opprettTilbakekreving } from '@api/opprettTilbakekreving';
import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('@api/client/apiClient', () => ({
    apiClient: {
        post: vi.fn(),
    },
}));

afterEach(() => {
    vi.clearAllMocks();
});

describe('opprettTilbakekreving', () => {
    test('skal sende forespørsel om opprettelse av tilbakekreving', async () => {
        const fagsakId = 123;
        const payload = { fagsakId };

        vi.mocked(apiClient.post).mockResolvedValueOnce(fagsakId); // TODO: finn ut hva som returneres fra KS BE

        const svar = await opprettTilbakekreving(payload);

        expect(apiClient.post).toHaveBeenCalledTimes(1);
        expect(apiClient.post).toHaveBeenCalledWith({
            data: payload,
            url: `/familie-ks-sak/api/tilbakekreving/manuell`,
        });
        expect(svar).toEqual(fagsakId);
    });

    test('skal håndtere feil', async () => {
        vi.mocked(apiClient.post).mockRejectedValue(new Error('Noe gikk galt'));

        const fagsakId = 123;
        const payload = { fagsakId };

        await expect(opprettTilbakekreving(payload)).rejects.toThrow('Noe gikk galt');
    });
});
