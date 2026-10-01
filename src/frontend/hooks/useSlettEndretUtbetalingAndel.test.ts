import { slettEndretUtbetalingAndel } from '@api/slettEndretUtbetalingAndel';
import { renderHook, waitFor } from '@testing-library/react';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { TestProviders } from '@testutils/testrender';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { useSlettEndretUtbetalingAndel } from './useSlettEndretUtbetalingAndel';
import { useSlettEndretUtbetalingAndelIsPending } from './useSlettEndretUtbetalingAndelIsPending';

vi.mock('@api/slettEndretUtbetalingAndel');

afterEach(() => {
    vi.clearAllMocks();
});

const parameters = { behandlingId: 123 };

describe('useSlettEndretUtbetalingAndel', () => {
    test('kaller slettEndretUtbetalingAndel med riktige parametre', async () => {
        // Arrange
        const behandling = lagBehandling({ behandlingId: 123 });
        vi.mocked(slettEndretUtbetalingAndel).mockResolvedValue(behandling);

        const { result } = renderHook(() => useSlettEndretUtbetalingAndel(456), { wrapper: TestProviders });

        // Act
        result.current.mutate(parameters);

        // Assert
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(slettEndretUtbetalingAndel).toHaveBeenCalledWith(123, 456);
        expect(result.current.data).toEqual(behandling);
    });

    test('Skal håndtere feil', async () => {
        // Arrange
        vi.mocked(slettEndretUtbetalingAndel).mockRejectedValue(new Error('Noe gikk galt'));

        const { result } = renderHook(() => useSlettEndretUtbetalingAndel(456), { wrapper: TestProviders });

        // Act
        result.current.mutate(parameters);

        // Assert
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe('Noe gikk galt');
    });

    test('isPending-hook er true kun for andelen som slettes', async () => {
        // Arrange
        let resolve: (behandling: ReturnType<typeof lagBehandling>) => void = () => {};
        vi.mocked(slettEndretUtbetalingAndel).mockReturnValue(new Promise(r => (resolve = r)));

        const { result } = renderHook(
            () => ({
                mutation: useSlettEndretUtbetalingAndel(456),
                isPending: useSlettEndretUtbetalingAndelIsPending(456),
                annenIsPending: useSlettEndretUtbetalingAndelIsPending(789),
            }),
            { wrapper: TestProviders }
        );

        // Act
        result.current.mutation.mutate(parameters);

        // Assert
        await waitFor(() => expect(result.current.isPending).toBe(true));
        expect(result.current.annenIsPending).toBe(false);

        resolve(lagBehandling());
        await waitFor(() => expect(result.current.isPending).toBe(false));
    });
});
