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
        const payload = { fagsakId: 123 };

        vi.mocked(apiClient.post).mockResolvedValueOnce(undefined);

        const svar = await opprettTilbakekreving(payload);

        expect(apiClient.post).toHaveBeenCalledTimes(1);
        expect(apiClient.post).toHaveBeenCalledWith({
            data: payload,
            url: `/familie-ks-sak/api/tilbakekreving/manuell`,
        });
        expect(svar).toBeUndefined();
    });

    test('skal håndtere feil', async () => {
        vi.mocked(apiClient.post).mockRejectedValue(new Error('Noe gikk galt'));

        const payload = { fagsakId: 123 };

        await expect(opprettTilbakekreving(payload)).rejects.toThrow('Noe gikk galt');
    });
});
