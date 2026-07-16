import { apiClient } from '@api/client/apiClient';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { opprettOvergangsordningAndel } from './opprettOvergangsordningAndel';

vi.mock('@api/client/apiClient', () => ({
    apiClient: { post: vi.fn() },
}));

afterEach(() => {
    vi.clearAllMocks();
});

describe('opprettOvergangsordningAndel', () => {
    test('kaller POST med riktig URL, og får forventet resultat', async () => {
        // Arrange
        const behandling = lagBehandling({ behandlingId: 123 });
        vi.mocked(apiClient.post).mockResolvedValue(behandling);

        // Act
        const result = await opprettOvergangsordningAndel(behandling.behandlingId);

        // Assert
        expect(apiClient.post).toHaveBeenCalledWith({
            data: {},
            url: `/familie-ks-sak/api/overgangsordningandel/${behandling.behandlingId}`,
        });
        expect(result).toEqual(behandling);
    });

    test('Skal håndtere feil', async () => {
        // Arrange
        vi.mocked(apiClient.post).mockRejectedValue(new Error('Noe gikk galt'));

        // Act & assert
        await expect(opprettOvergangsordningAndel(123)).rejects.toThrow();
    });
});
