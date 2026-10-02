import { apiClient } from '@api/client/apiClient';
import type { EndringsårsakbegrunnelseTekster } from '@typer/endretUtbetaling';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { hentEndretUtbetalingBegrunnelser } from './hentEndretUtbetalingBegrunnelser';

vi.mock('@api/client/apiClient', () => ({
    apiClient: { get: vi.fn() },
}));

afterEach(() => {
    vi.clearAllMocks();
});

const begrunnelser = {} as EndringsårsakbegrunnelseTekster;

describe('hentEndretUtbetalingBegrunnelser', () => {
    test('kaller GET med riktig URL, og får forventet resultat', async () => {
        // Arrange
        vi.mocked(apiClient.get).mockResolvedValue(begrunnelser);

        // Act
        const result = await hentEndretUtbetalingBegrunnelser();

        // Assert
        expect(apiClient.get).toHaveBeenCalledWith({
            url: '/familie-ks-sak/api/endretutbetalingandel/endret-utbetaling-vedtaksbegrunnelser',
        });
        expect(result).toEqual(begrunnelser);
    });

    test('Skal håndtere feil', async () => {
        // Arrange
        vi.mocked(apiClient.get).mockRejectedValue(new Error('Noe gikk galt'));

        // Act & assert
        await expect(hentEndretUtbetalingBegrunnelser()).rejects.toThrow();
    });
});
