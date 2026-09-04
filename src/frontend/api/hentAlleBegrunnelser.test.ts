import { apiClient } from '@api/client/apiClient';
import { hentAlleBegrunnelser } from '@api/hentAlleBegrunnelser';
import type { AlleBegrunnelser } from '@typer/vilkår';
import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('@api/client/apiClient', () => ({
    apiClient: {
        get: vi.fn(),
    },
}));

afterEach(() => {
    vi.clearAllMocks();
});

const alleBegrunnelser = {} as AlleBegrunnelser;

describe('hentAlleBegrunnelser', () => {
    test('skal sende forespørsel om å hente alle begrunnelser', async () => {
        vi.mocked(apiClient.get).mockResolvedValueOnce(alleBegrunnelser);

        const svar = await hentAlleBegrunnelser();

        expect(apiClient.get).toHaveBeenCalledTimes(1);
        expect(apiClient.get).toHaveBeenCalledWith({
            url: `/familie-ks-sak/api/vilkårsvurdering/vilkaarsbegrunnelser`,
        });
        expect(svar).toEqual(alleBegrunnelser);
    });

    test('skal håndtere feil', async () => {
        vi.mocked(apiClient.get).mockRejectedValue(new Error('Noe gikk galt'));

        await expect(hentAlleBegrunnelser()).rejects.toThrow('Noe gikk galt');
    });
});
