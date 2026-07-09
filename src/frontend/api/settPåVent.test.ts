import { apiClient } from '@api/client/apiClient';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { SettPåVentÅrsak } from '@typer/behandling';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { settPåVent, type SettPåVentPayload } from './settPåVent';

vi.mock('@api/client/apiClient', () => ({
    apiClient: { request: vi.fn() },
}));

afterEach(() => {
    vi.clearAllMocks();
});

describe('settPåVent', () => {
    const payload: SettPåVentPayload = {
        frist: '2025-10-10',
        årsak: SettPåVentÅrsak.AVVENTER_DOKUMENTASJON,
    };

    test('kaller POST mot sett-på-vent-endepunktet når behandlingen ikke allerede er på vent', async () => {
        // Arrange
        const behandling = lagBehandling({ behandlingId: 123 });
        vi.mocked(apiClient.request).mockResolvedValue(behandling);

        // Act
        const result = await settPåVent(behandling.behandlingId, payload, false);

        // Assert
        expect(apiClient.request).toHaveBeenCalledWith({
            method: 'POST',
            url: `/familie-ks-sak/api/behandlinger/${behandling.behandlingId}/sett-på-vent`,
            data: payload,
        });
        expect(result).toEqual(behandling);
    });

    test('kaller PUT mot oppdater-endepunktet når behandlingen allerede er på vent', async () => {
        // Arrange
        const behandling = lagBehandling({ behandlingId: 123 });
        vi.mocked(apiClient.request).mockResolvedValue(behandling);

        // Act
        const result = await settPåVent(behandling.behandlingId, payload, true);

        // Assert
        expect(apiClient.request).toHaveBeenCalledWith({
            method: 'PUT',
            url: `/familie-ks-sak/api/behandlinger/${behandling.behandlingId}/sett-på-vent/oppdater`,
            data: payload,
        });
        expect(result).toEqual(behandling);
    });

    test('kaster feil når apiClient feiler ved POST', async () => {
        // Arrange
        const behandling = lagBehandling({ behandlingId: 123 });
        vi.mocked(apiClient.request).mockRejectedValue(new Error('Noe gikk galt'));

        // Act & Assert
        await expect(settPåVent(behandling.behandlingId, payload, false)).rejects.toThrow('Noe gikk galt');
    });

    test('kaster feil når apiClient feiler ved PUT', async () => {
        // Arrange
        const behandling = lagBehandling({ behandlingId: 123 });
        vi.mocked(apiClient.request).mockRejectedValue(new Error('Noe gikk galt'));

        // Act & Assert
        await expect(settPåVent(behandling.behandlingId, payload, true)).rejects.toThrow('Noe gikk galt');
    });
});
