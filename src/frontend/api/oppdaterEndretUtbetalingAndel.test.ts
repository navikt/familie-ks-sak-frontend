import { apiClient } from '@api/client/apiClient';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { IEndretUtbetalingAndelÅrsak, type IRestEndretUtbetalingAndel } from '@typer/utbetalingAndel';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { oppdaterEndretUtbetalingAndel } from './oppdaterEndretUtbetalingAndel';

vi.mock('@api/client/apiClient', () => ({
    apiClient: { put: vi.fn() },
}));

afterEach(() => {
    vi.clearAllMocks();
});

const payload: IRestEndretUtbetalingAndel = {
    id: 456,
    personIdenter: ['12345678910', '10987654321'],
    prosent: 100,
    fom: '2024-01',
    tom: '2024-06',
    årsak: IEndretUtbetalingAndelÅrsak.ALLEREDE_UTBETALT,
    begrunnelse: 'Begrunnelse',
};

describe('oppdaterEndretUtbetalingAndel', () => {
    test('kaller PUT med riktig URL og payload, og får forventet resultat', async () => {
        // Arrange
        const behandling = lagBehandling({ behandlingId: 123 });
        vi.mocked(apiClient.put).mockResolvedValue(behandling);

        // Act
        const result = await oppdaterEndretUtbetalingAndel(123, 456, payload);

        // Assert
        expect(apiClient.put).toHaveBeenCalledWith({
            data: payload,
            url: '/familie-ks-sak/api/endretutbetalingandel/123/456',
        });
        expect(result).toEqual(behandling);
    });

    test('Skal håndtere feil', async () => {
        // Arrange
        vi.mocked(apiClient.put).mockRejectedValue(new Error('Noe gikk galt'));

        // Act & assert
        await expect(oppdaterEndretUtbetalingAndel(123, 456, payload)).rejects.toThrow();
    });
});
