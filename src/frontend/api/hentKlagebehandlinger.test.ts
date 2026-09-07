import { apiClient } from '@api/client/apiClient';
import { lagKlagebehandling } from '@testutils/testdata/klageTestdata';
import type { IKlagebehandling } from '@typer/klage';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { hentKlagebehandlinger } from './hentKlagebehandlinger';

vi.mock('@api/client/apiClient', () => ({
    apiClient: { get: vi.fn() },
}));

afterEach(() => {
    vi.clearAllMocks();
});

const klagebehandlinger: IKlagebehandling[] = [lagKlagebehandling()];

describe('hentKlagebehandlinger', () => {
    test('kaller GET med riktig URL, og får forventet resultat', async () => {
        // Arrange
        vi.mocked(apiClient.get).mockResolvedValue(klagebehandlinger);

        // Act
        const result = await hentKlagebehandlinger(1);

        // Assert
        expect(apiClient.get).toHaveBeenCalledWith({
            url: `/familie-ks-sak/api/fagsaker/1/hent-klagebehandlinger`,
        });
        expect(result).toEqual(klagebehandlinger);
    });

    test('Skal håndtere feil', async () => {
        // Arrange
        vi.mocked(apiClient.get).mockRejectedValue(new Error('Noe gikk galt'));

        // Act & assert
        await expect(hentKlagebehandlinger(1)).rejects.toThrow();
    });
});
