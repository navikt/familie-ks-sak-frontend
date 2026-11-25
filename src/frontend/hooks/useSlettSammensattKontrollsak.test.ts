import { slettSammensattKontrollsak } from '@api/slettSammensattKontrollsak';
import { useSlettSammensattKontrollsak } from '@hooks/useSlettSammensattKontrollsak';
import { renderHook, waitFor } from '@testing-library/react';
import { lagSammensattKontrollsak } from '@testutils/testdata/sammensattKontrollsakTestdata';
import { TestProviders } from '@testutils/testrender';
import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('@api/slettSammensattKontrollsak');

afterEach(() => {
    vi.clearAllMocks();
});

const behandlingId = 1;
const sammensattKontrollsak = lagSammensattKontrollsak({ id: 42 });
const resultat = 42;

describe('useSlettSammensattKontrollsak', () => {
    test('kaller slettSammensattKontrollsak med id-en til sammensatt kontrollsak', async () => {
        // Arrange
        vi.mocked(slettSammensattKontrollsak).mockResolvedValue(resultat);

        const { result } = renderHook(() => useSlettSammensattKontrollsak(behandlingId), {
            wrapper: TestProviders,
        });

        // Act
        result.current.mutate(sammensattKontrollsak);

        // Assert
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(slettSammensattKontrollsak).toHaveBeenCalledWith({ id: 42 });
        expect(result.current.data).toEqual(resultat);
    });

    test('skal kalle onSuccess-callback ved vellykket mutasjon', async () => {
        // Arrange
        const onSuccess = vi.fn();
        vi.mocked(slettSammensattKontrollsak).mockResolvedValue(resultat);

        const { result } = renderHook(() => useSlettSammensattKontrollsak(behandlingId, { onSuccess }), {
            wrapper: TestProviders,
        });

        // Act
        result.current.mutate(sammensattKontrollsak);

        // Assert
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(onSuccess).toHaveBeenCalledWith(resultat, sammensattKontrollsak, undefined, expect.any(Object));
    });

    test('skal sette isError dersom slettSammensattKontrollsak feiler', async () => {
        // Arrange
        vi.mocked(slettSammensattKontrollsak).mockRejectedValueOnce(new Error('Noe gikk galt'));

        const { result } = renderHook(() => useSlettSammensattKontrollsak(behandlingId), {
            wrapper: TestProviders,
        });

        // Act
        result.current.mutate(sammensattKontrollsak);

        // Assert
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe('Noe gikk galt');
    });
});
