import { apiClient } from '@api/client/apiClient';
import { oppdaterSammensattKontrollsak } from '@api/oppdaterSammensattKontrollsak';
import {
    lagOppdaterSammensattKontrollsak,
    lagSammensattKontrollsak,
} from '@testutils/testdata/sammensattKontrollsakTestdata';
import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('@api/client/apiClient', () => ({
    apiClient: {
        put: vi.fn(),
    },
}));

afterEach(() => {
    vi.clearAllMocks();
});

const payload = lagOppdaterSammensattKontrollsak({ fritekst: 'Oppdatert fritekst' });

describe('oppdaterSammensattKontrollsak', () => {
    test('skal sende forespørsel om å oppdatere sammensatt kontrollsak', async () => {
        const oppdatert = lagSammensattKontrollsak({ fritekst: 'Oppdatert fritekst' });
        vi.mocked(apiClient.put).mockResolvedValueOnce(oppdatert);

        const svar = await oppdaterSammensattKontrollsak(payload);

        expect(apiClient.put).toHaveBeenCalledTimes(1);
        expect(apiClient.put).toHaveBeenCalledWith({
            data: payload,
            url: '/familie-ks-sak/api/sammensatt-kontrollsak',
        });
        expect(svar).toEqual(oppdatert);
    });

    test('skal håndtere feil', async () => {
        vi.mocked(apiClient.put).mockRejectedValue(new Error('Noe gikk galt'));

        await expect(oppdaterSammensattKontrollsak(payload)).rejects.toThrow('Noe gikk galt');
    });
});
