import { fordelOppgave } from '@api/fordelOppgave';
import { renderHook, waitFor } from '@testing-library/react';
import { TestProviders } from '@testutils/testrender';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { useFordelOppgave } from './useFordelOppgave';

vi.mock('@api/fordelOppgave');

afterEach(() => {
    vi.clearAllMocks();
});

describe('useFordelOppgave', () => {
    test('kaller fordelOppgave med oppgaveId som path-parameter og saksbehandler som query-parameter', async () => {
        // Arrange
        vi.mocked(fordelOppgave).mockResolvedValue('Z999999');

        const { result } = renderHook(() => useFordelOppgave(), {
            wrapper: TestProviders,
        });

        // Act
        result.current.mutate({ oppgaveId: '123', saksbehandler: 'Z999999' });

        // Assert
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(fordelOppgave).toHaveBeenCalledWith({ oppgaveId: '123' }, { saksbehandler: 'Z999999' });
        expect(result.current.data).toBe('Z999999');
    });

    test('kaller onSuccess-callback ved vellykket mutasjon', async () => {
        // Arrange
        const onSuccess = vi.fn();
        const parameters = { oppgaveId: '123', saksbehandler: 'Z999999' };
        vi.mocked(fordelOppgave).mockResolvedValue('Z999999');

        const { result } = renderHook(() => useFordelOppgave({ onSuccess }), {
            wrapper: TestProviders,
        });

        // Act
        result.current.mutate(parameters);

        // Assert
        await waitFor(() =>
            expect(onSuccess).toHaveBeenCalledWith('Z999999', parameters, undefined, expect.any(Object))
        );
    });

    test('skal håndtere feil', async () => {
        // Arrange
        vi.mocked(fordelOppgave).mockRejectedValue(new Error('Noe gikk galt'));

        const { result } = renderHook(() => useFordelOppgave(), {
            wrapper: TestProviders,
        });

        // Act
        result.current.mutate({ oppgaveId: '123', saksbehandler: 'Z999999' });

        // Assert
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe('Noe gikk galt');
    });
});
