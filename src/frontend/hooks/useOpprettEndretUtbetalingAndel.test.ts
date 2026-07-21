import { opprettEndretUtbetalingAndel } from '@api/opprettEndretUtbetalingAndel';
import { renderHook, waitFor } from '@testing-library/react';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { TestProviders } from '@testutils/testrender';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { useOpprettEndretUtbetalingAndel } from './useOpprettEndretUtbetalingAndel';

vi.mock('@api/opprettEndretUtbetalingAndel');

afterEach(() => {
    vi.clearAllMocks();
});

const parameters = { behandlingId: 123 };

describe('useOpprettEndretUtbetalingAndel', () => {
    test('kaller opprettEndretUtbetalingAndel med riktig behandlingId', async () => {
        // Arrange
        const behandling = lagBehandling({ behandlingId: 123 });
        vi.mocked(opprettEndretUtbetalingAndel).mockResolvedValue(behandling);

        const { result } = renderHook(() => useOpprettEndretUtbetalingAndel(), {
            wrapper: TestProviders,
        });

        // Act
        result.current.mutate(parameters);

        // Assert
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(opprettEndretUtbetalingAndel).toHaveBeenCalledWith(parameters.behandlingId);
        expect(result.current.data).toEqual(behandling);
    });

    test('kaller onSuccess-callback med behandling ved vellykket mutasjon', async () => {
        // Arrange
        const behandling = lagBehandling({ behandlingId: 123 });
        const onSuccess = vi.fn();
        vi.mocked(opprettEndretUtbetalingAndel).mockResolvedValue(behandling);

        const { result } = renderHook(() => useOpprettEndretUtbetalingAndel({ onSuccess }), {
            wrapper: TestProviders,
        });

        // Act
        result.current.mutate(parameters);

        // Assert
        await waitFor(() =>
            expect(onSuccess).toHaveBeenCalledWith(behandling, parameters, undefined, expect.any(Object))
        );
    });

    test('Skal håndtere feil', async () => {
        // Arrange
        vi.mocked(opprettEndretUtbetalingAndel).mockRejectedValue(new Error('Noe gikk galt'));

        const { result } = renderHook(() => useOpprettEndretUtbetalingAndel(), {
            wrapper: TestProviders,
        });

        // Act
        result.current.mutate(parameters);

        // Assert
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe('Noe gikk galt');
    });
});
