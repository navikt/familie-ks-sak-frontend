import { tilbakestillFordelingPåOppgave } from '@api/tilbakestillFordelingPåOppgave';
import { renderHook, waitFor } from '@testing-library/react';
import { lagOppgave } from '@testutils/testdata/oppgaveTestdata';
import { TestProviders } from '@testutils/testrender';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { useTilbakestillFordelingPåOppgave } from './useTilbakestillFordelingPåOppgave';

vi.mock('@api/tilbakestillFordelingPåOppgave');

afterEach(() => {
    vi.clearAllMocks();
});

describe('useTilbakestillFordelingPåOppgave', () => {
    test('kaller tilbakestillFordelingPåOppgave med riktig oppgaveId', async () => {
        // Arrange
        const oppgave = lagOppgave({ id: '123' });
        vi.mocked(tilbakestillFordelingPåOppgave).mockResolvedValue(oppgave);

        const { result } = renderHook(() => useTilbakestillFordelingPåOppgave(), {
            wrapper: TestProviders,
        });

        // Act
        result.current.mutate({ oppgaveId: oppgave.id });

        // Assert
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(tilbakestillFordelingPåOppgave).toHaveBeenCalledWith({ oppgaveId: '123' });
        expect(result.current.data).toEqual(oppgave);
    });

    test('kaller onSuccess-callback med oppgave ved vellykket mutasjon', async () => {
        // Arrange
        const oppgave = lagOppgave({ id: '123' });
        const onSuccess = vi.fn();
        vi.mocked(tilbakestillFordelingPåOppgave).mockResolvedValue(oppgave);

        const { result } = renderHook(() => useTilbakestillFordelingPåOppgave({ onSuccess }), {
            wrapper: TestProviders,
        });

        // Act
        result.current.mutate({ oppgaveId: oppgave.id });

        // Assert
        await waitFor(() =>
            expect(onSuccess).toHaveBeenCalledWith(oppgave, { oppgaveId: '123' }, undefined, expect.any(Object))
        );
    });

    test('skal håndtere feil', async () => {
        // Arrange
        vi.mocked(tilbakestillFordelingPåOppgave).mockRejectedValue(new Error('Noe gikk galt'));

        const { result } = renderHook(() => useTilbakestillFordelingPåOppgave(), {
            wrapper: TestProviders,
        });

        // Act
        result.current.mutate({ oppgaveId: '123' });

        // Assert
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe('Noe gikk galt');
    });
});
