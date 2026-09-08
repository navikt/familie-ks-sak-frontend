import { apiClient } from '@api/client/apiClient';
import { oppdaterBehandlendeEnhet, type OppdaterBehandlendeEnhetPayload } from '@api/oppdaterBehandlendeEnhet';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('@api/client/apiClient', () => ({
    apiClient: {
        put: vi.fn(),
    },
}));

afterEach(() => {
    vi.clearAllMocks();
});

const payload: OppdaterBehandlendeEnhetPayload = {
    enhetId: '4806',
    begrunnelse: 'Flytter saken til riktig enhet.',
};

const behandling = lagBehandling();
const behandlingId = behandling.behandlingId;

describe('oppdaterBehandlendeEnhet', () => {
    test('skal sende forespørsel om å oppdatere behandlende enhet', async () => {
        vi.mocked(apiClient.put).mockResolvedValueOnce(behandling);

        const svar = await oppdaterBehandlendeEnhet(behandlingId, payload);

        expect(apiClient.put).toHaveBeenCalledTimes(1);
        expect(apiClient.put).toHaveBeenCalledWith({
            data: payload,
            url: `/familie-ks-sak/api/behandlinger/${behandlingId}/enhet`,
        });
        expect(svar).toEqual(behandling);
    });

    test('skal håndtere feil', async () => {
        vi.mocked(apiClient.put).mockRejectedValue(new Error('Noe gikk galt'));

        await expect(oppdaterBehandlendeEnhet(behandlingId, payload)).rejects.toThrow('Noe gikk galt');
    });
});
