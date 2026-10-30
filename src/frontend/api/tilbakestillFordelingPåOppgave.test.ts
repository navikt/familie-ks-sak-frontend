import { apiClient } from '@api/client/apiClient';
import { lagOppgave } from '@testutils/testdata/oppgaveTestdata';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { tilbakestillFordelingPåOppgave } from './tilbakestillFordelingPåOppgave';

vi.mock('@api/client/apiClient', () => ({
    apiClient: { post: vi.fn() },
}));

afterEach(() => {
    vi.clearAllMocks();
});

describe('tilbakestillFordelingPåOppgave', () => {
    test('kaller POST mot tilbakestill-endepunktet og får forventet resultat', async () => {
        // Arrange
        const oppgave = lagOppgave({ id: '123' });
        vi.mocked(apiClient.post).mockResolvedValue(oppgave);

        // Act
        const result = await tilbakestillFordelingPåOppgave({ oppgaveId: oppgave.id });

        // Assert
        expect(apiClient.post).toHaveBeenCalledWith({
            url: '/familie-ks-sak/api/oppgave/123/tilbakestill',
        });
        expect(result).toEqual(oppgave);
    });

    test('kaster feil når apiClient feiler', async () => {
        // Arrange
        vi.mocked(apiClient.post).mockRejectedValue(new Error('Noe gikk galt'));

        // Act & Assert
        await expect(tilbakestillFordelingPåOppgave({ oppgaveId: '123' })).rejects.toThrow('Noe gikk galt');
    });
});
