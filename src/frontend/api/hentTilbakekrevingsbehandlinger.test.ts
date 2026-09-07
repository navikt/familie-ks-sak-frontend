import { apiClient } from '@api/client/apiClient';
import { lagTilbakekrevingbehandling } from '@testutils/testdata/tilbakekrevingTestdata';
import type { ITilbakekrevingsbehandling } from '@typer/tilbakekrevingsbehandling';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { hentTilbakekrevingsbehandlinger } from './hentTilbakekrevingsbehandlinger';

vi.mock('@api/client/apiClient', () => ({
    apiClient: { get: vi.fn() },
}));

afterEach(() => {
    vi.clearAllMocks();
});

const tilbakekrevingsbehandlinger: ITilbakekrevingsbehandling[] = [lagTilbakekrevingbehandling()];

describe('hentTilbakekrevingsbehandlinger', () => {
    test('kaller GET med riktig URL, og får forventet resultat', async () => {
        // Arrange
        vi.mocked(apiClient.get).mockResolvedValue(tilbakekrevingsbehandlinger);

        // Act
        const result = await hentTilbakekrevingsbehandlinger(1);

        // Assert
        expect(apiClient.get).toHaveBeenCalledWith({
            url: `/familie-ks-sak/api/tilbakekreving/fagsak/1`,
        });
        expect(result).toEqual(tilbakekrevingsbehandlinger);
    });

    test('Skal håndtere feil', async () => {
        // Arrange
        vi.mocked(apiClient.get).mockRejectedValue(new Error('Noe gikk galt'));

        // Act & assert
        await expect(hentTilbakekrevingsbehandlinger(1)).rejects.toThrow();
    });
});
