import { apiClient } from '@api/client/apiClient';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { fordelOppgave } from './fordelOppgave';

vi.mock('@api/client/apiClient', () => ({
    apiClient: { post: vi.fn() },
}));

afterEach(() => {
    vi.clearAllMocks();
});

describe('fordelOppgave', () => {
    test('kaller POST mot fordel-endepunktet med saksbehandler som query-parameter', async () => {
        // Arrange
        vi.mocked(apiClient.post).mockResolvedValue('Z999999');

        // Act
        const result = await fordelOppgave({ oppgaveId: '123' }, { saksbehandler: 'Z999999' });

        // Assert
        expect(apiClient.post).toHaveBeenCalledWith({
            url: '/familie-ks-sak/api/oppgave/123/fordel',
            params: { saksbehandler: 'Z999999' },
        });
        expect(result).toBe('Z999999');
    });

    test('kaster feil når apiClient feiler', async () => {
        // Arrange
        vi.mocked(apiClient.post).mockRejectedValue(new Error('Noe gikk galt'));

        // Act & Assert
        await expect(fordelOppgave({ oppgaveId: '123' }, { saksbehandler: 'Z999999' })).rejects.toThrow(
            'Noe gikk galt'
        );
    });
});
