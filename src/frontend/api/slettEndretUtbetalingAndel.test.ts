import { apiClient } from '@api/client/apiClient';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { slettEndretUtbetalingAndel } from './slettEndretUtbetalingAndel';

vi.mock('@api/client/apiClient', () => ({
    apiClient: { delete: vi.fn() },
}));

afterEach(() => {
    vi.clearAllMocks();
});

describe('slettEndretUtbetalingAndel', () => {
    test('kaller DELETE med riktig URL, og får forventet resultat', async () => {
        // Arrange
        const behandling = lagBehandling({ behandlingId: 123 });
        vi.mocked(apiClient.delete).mockResolvedValue(behandling);

        // Act
        const result = await slettEndretUtbetalingAndel(123, 456);

        // Assert
        expect(apiClient.delete).toHaveBeenCalledWith({
            url: '/familie-ks-sak/api/endretutbetalingandel/123/456',
        });
        expect(result).toEqual(behandling);
    });

    test('Skal håndtere feil', async () => {
        // Arrange
        vi.mocked(apiClient.delete).mockRejectedValue(new Error('Noe gikk galt'));

        // Act & assert
        await expect(slettEndretUtbetalingAndel(123, 456)).rejects.toThrow();
    });
});
