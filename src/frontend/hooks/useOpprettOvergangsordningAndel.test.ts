import { opprettOvergangsordningAndel } from '@api/opprettOvergangsordningAndel';
import { renderHook, waitFor } from '@testing-library/react';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { TestProviders } from '@testutils/testrender';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { useOpprettOvergangsordningAndel } from './useOpprettOvergangsordningAndel';

vi.mock('@api/opprettOvergangsordningAndel');

afterEach(() => {
    vi.clearAllMocks();
});

const parameters = { behandlingId: 123 };

describe('useOpprettOvergangsordningAndel', () => {
    test('kaller opprettOvergangsordningAndel med riktig behandlingId', async () => {
        // Arrange
        const behandling = lagBehandling({ behandlingId: 123 });
        vi.mocked(opprettOvergangsordningAndel).mockResolvedValue(behandling);

        const { result } = renderHook(() => useOpprettOvergangsordningAndel(), {
            wrapper: TestProviders,
        });

        // Act
        result.current.mutate(parameters);

        // Assert
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(opprettOvergangsordningAndel).toHaveBeenCalledWith(parameters.behandlingId);
        expect(result.current.data).toEqual(behandling);
    });

    test('kaller onSuccess-callback med behandling ved vellykket mutasjon', async () => {
        // Arrange
        const behandling = lagBehandling({ behandlingId: 123 });
        const onSuccess = vi.fn();
        vi.mocked(opprettOvergangsordningAndel).mockResolvedValue(behandling);

        const { result } = renderHook(() => useOpprettOvergangsordningAndel({ onSuccess }), {
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
        vi.mocked(opprettOvergangsordningAndel).mockRejectedValue(new Error('Noe gikk galt'));

        const { result } = renderHook(() => useOpprettOvergangsordningAndel(), {
            wrapper: TestProviders,
        });

        // Act
        result.current.mutate(parameters);

        // Assert
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe('Noe gikk galt');
    });
});
