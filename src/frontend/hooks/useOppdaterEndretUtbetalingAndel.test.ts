import { oppdaterEndretUtbetalingAndel } from '@api/oppdaterEndretUtbetalingAndel';
import { renderHook, waitFor } from '@testing-library/react';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { TestProviders } from '@testutils/testrender';
import type { IRestEndretUtbetalingAndel } from '@typer/utbetalingAndel';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { useOppdaterEndretUtbetalingAndel } from './useOppdaterEndretUtbetalingAndel';
import { useOppdaterEndretUtbetalingAndelIsPending } from './useOppdaterEndretUtbetalingAndelIsPending';

vi.mock('@api/oppdaterEndretUtbetalingAndel');

afterEach(() => {
    vi.clearAllMocks();
});

const payload: IRestEndretUtbetalingAndel = { id: 456, prosent: 100 };
const parametre = { behandlingId: 123, endretUtbetalingAndelId: 456 };

describe('useOppdaterEndretUtbetalingAndel', () => {
    test('kaller oppdaterEndretUtbetalingAndel med riktige parametre', async () => {
        // Arrange
        const behandling = lagBehandling({ behandlingId: 123 });
        vi.mocked(oppdaterEndretUtbetalingAndel).mockResolvedValue(behandling);

        const { result } = renderHook(() => useOppdaterEndretUtbetalingAndel(parametre), { wrapper: TestProviders });

        // Act
        result.current.mutate(payload);

        // Assert
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(oppdaterEndretUtbetalingAndel).toHaveBeenCalledWith(123, 456, payload);
        expect(result.current.data).toEqual(behandling);
    });

    test('Skal håndtere feil', async () => {
        // Arrange
        vi.mocked(oppdaterEndretUtbetalingAndel).mockRejectedValue(new Error('Noe gikk galt'));

        const { result } = renderHook(() => useOppdaterEndretUtbetalingAndel(parametre), { wrapper: TestProviders });

        // Act
        result.current.mutate(payload);

        // Assert
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe('Noe gikk galt');
    });

    test('isPending-hook er true kun for andelen som oppdateres', async () => {
        // Arrange
        let resolve: (behandling: ReturnType<typeof lagBehandling>) => void = () => {};
        vi.mocked(oppdaterEndretUtbetalingAndel).mockReturnValue(new Promise(r => (resolve = r)));

        const { result } = renderHook(
            () => ({
                mutation: useOppdaterEndretUtbetalingAndel(parametre),
                isPending: useOppdaterEndretUtbetalingAndelIsPending(456),
                annenIsPending: useOppdaterEndretUtbetalingAndelIsPending(789),
            }),
            { wrapper: TestProviders }
        );

        // Act
        result.current.mutation.mutate(payload);

        // Assert
        await waitFor(() => expect(result.current.isPending).toBe(true));
        expect(result.current.annenIsPending).toBe(false);

        resolve(lagBehandling());
        await waitFor(() => expect(result.current.isPending).toBe(false));
    });
});
