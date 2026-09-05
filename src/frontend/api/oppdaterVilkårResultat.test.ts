import { apiClient } from '@api/client/apiClient';
import { oppdaterVilkårResultat } from '@api/oppdaterVilkårResultat';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { lagVilkårResultat } from '@testutils/testdata/vilkårResultatTestdata';
import type { IEndreVilkårResultat } from '@typer/vilkår';
import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('@api/client/apiClient', () => ({
    apiClient: {
        put: vi.fn(),
    },
}));

afterEach(() => {
    vi.clearAllMocks();
});

const endreVilkårResultat: IEndreVilkårResultat = {
    personIdent: '12345678910',
    endretVilkårResultat: lagVilkårResultat({ id: 7 }),
};

describe('oppdaterVilkårResultat', () => {
    test('skal sende PUT-forespørsel med riktig URL og data', async () => {
        const behandling = lagBehandling({ behandlingId: 123 });
        vi.mocked(apiClient.put).mockResolvedValueOnce(behandling);

        const svar = await oppdaterVilkårResultat(123, endreVilkårResultat);

        expect(apiClient.put).toHaveBeenCalledTimes(1);
        expect(apiClient.put).toHaveBeenCalledWith({
            url: '/familie-ks-sak/api/vilkårsvurdering/123',
            data: endreVilkårResultat,
        });
        expect(svar).toEqual(behandling);
    });

    test('skal kaste videre feilen dersom apiClient.put feiler', async () => {
        vi.mocked(apiClient.put).mockRejectedValueOnce(new Error('Noe gikk feil'));

        await expect(oppdaterVilkårResultat(123, endreVilkårResultat)).rejects.toThrow('Noe gikk feil');
    });
});
