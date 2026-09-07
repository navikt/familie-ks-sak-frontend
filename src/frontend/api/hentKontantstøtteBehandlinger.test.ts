import { apiClient } from '@api/client/apiClient';
import type { VisningBehandling } from '@sider/Fagsak/Saksoversikt/visningBehandling';
import { lagVisningBehandling } from '@testutils/testdata/behandlingTestdata';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { hentKontantstøtteBehandlinger } from './hentKontantstøtteBehandlinger';

vi.mock('@api/client/apiClient', () => ({
    apiClient: { get: vi.fn() },
}));

afterEach(() => {
    vi.clearAllMocks();
});

const behandlinger: VisningBehandling[] = [lagVisningBehandling()];

describe('hentKontantstøtteBehandlinger', () => {
    test('kaller GET med riktig URL, og får forventet resultat', async () => {
        // Arrange
        vi.mocked(apiClient.get).mockResolvedValue(behandlinger);

        // Act
        const result = await hentKontantstøtteBehandlinger(1);

        // Assert
        expect(apiClient.get).toHaveBeenCalledWith({
            url: `/familie-ks-sak/api/behandlinger/fagsak/1`,
        });
        expect(result).toEqual(behandlinger);
    });

    test('Skal håndtere feil', async () => {
        // Arrange
        vi.mocked(apiClient.get).mockRejectedValue(new Error('Noe gikk galt'));

        // Act & assert
        await expect(hentKontantstøtteBehandlinger(1)).rejects.toThrow();
    });
});
