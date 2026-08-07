import { opprettTilbakekreving } from '@api/opprettTilbakekreving';
import { useOpprettTilbakekreving } from '@hooks/useOpprettTilbakekreving';
import { renderHook, waitFor } from '@testing-library/react';
import { TestProviders } from '@testutils/testrender';
import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('@api/opprettTilbakekreving');

afterEach(() => {
    vi.clearAllMocks();
});

describe('useOpprettTilbakekreving', () => {
    test('kaller opprettTilbakekreving med riktig fagsakId', async () => {
        // Arrange
        const fagsakId = 123;
        vi.mocked(opprettTilbakekreving).mockResolvedValue(undefined);

        const { result } = renderHook(() => useOpprettTilbakekreving(), {
            wrapper: TestProviders,
        });

        // Act
        result.current.mutate({ fagsakId });

        // Assert
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(opprettTilbakekreving).toHaveBeenCalledWith({ fagsakId });
        expect(result.current.data).toEqual(undefined);
    });

    test('skal kalle onSuccess-callback ved vellykket mutasjon', async () => {
        // Arrange
        const fagsakId = 123;
        const onSuccess = vi.fn();
        vi.mocked(opprettTilbakekreving).mockResolvedValue(undefined);

        const { result } = renderHook(() => useOpprettTilbakekreving({ onSuccess }), {
            wrapper: TestProviders,
        });

        // Act
        result.current.mutate({ fagsakId });

        // Assert
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(onSuccess).toHaveBeenCalledWith(undefined, { fagsakId }, undefined, expect.any(Object));
    });

    test('skal sette isError dersom opprettTilbakekreving feiler', async () => {
        // Arrange
        const fagsakId = 123;
        const feilmelding = new Error('Noe gikk galt');
        vi.mocked(opprettTilbakekreving).mockRejectedValueOnce(feilmelding);

        const { result } = renderHook(() => useOpprettTilbakekreving(), {
            wrapper: TestProviders,
        });

        // Act
        result.current.mutate({ fagsakId });

        // Assert
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe('Noe gikk galt');
    });
});
