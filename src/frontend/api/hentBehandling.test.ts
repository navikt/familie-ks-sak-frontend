import { apiClient } from '@api/client/apiClient';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { hentBehandling } from './hentBehandling';

vi.mock('@api/client/apiClient', () => ({
    apiClient: { get: vi.fn() },
}));

afterEach(() => {
    vi.clearAllMocks();
});

const behandling = lagBehandling({ behandlingId: 1 });

describe('hentBehandling', () => {
    test('kaller GET med riktig URL, og får forventet resultat', async () => {
        // Arrange
        vi.mocked(apiClient.get).mockResolvedValue(behandling);

        // Act
        const result = await hentBehandling({ behandlingId: 1 });

        // Assert
        expect(apiClient.get).toHaveBeenCalledWith({
            url: '/familie-ks-sak/api/behandlinger/1',
        });
        expect(result).toEqual(behandling);
    });

    test('Skal håndtere feil', async () => {
        // Arrange
        vi.mocked(apiClient.get).mockRejectedValue(new Error('Noe gikk galt'));

        // Act & assert
        await expect(hentBehandling({ behandlingId: 1 })).rejects.toThrow('Noe gikk galt');
    });
});
