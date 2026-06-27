import { apiClient } from '@api/client/apiClient';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { taBehandlingAvVent } from './taBehandlingAvVent';

vi.mock('@api/client/apiClient', () => ({
    apiClient: { put: vi.fn() },
}));

afterEach(() => {
    vi.clearAllMocks();
});

describe('taBehandlingAvVent', () => {
    test('kaller PUT mot gjenoppta-endepunktet og får forventet resultat', async () => {
        // Arrange
        const behandling = lagBehandling({ behandlingId: 123 });
        vi.mocked(apiClient.put).mockResolvedValue(behandling);

        // Act
        const result = await taBehandlingAvVent(behandling.behandlingId);

        // Assert
        expect(apiClient.put).toHaveBeenCalledWith({
            url: `/familie-ks-sak/api/behandlinger/${behandling.behandlingId}/sett-på-vent/gjenoppta`,
        });
        expect(result).toEqual(behandling);
    });

    test('kaster feil når apiClient feiler', async () => {
        // Arrange
        const behandling = lagBehandling({ behandlingId: 123 });
        vi.mocked(apiClient.put).mockRejectedValue(new Error('Noe gikk galt'));

        // Act & Assert
        await expect(taBehandlingAvVent(behandling.behandlingId)).rejects.toThrow('Noe gikk galt');
    });
});
