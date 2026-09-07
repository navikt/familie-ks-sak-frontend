import { hentAlleBegrunnelser } from '@api/hentAlleBegrunnelser';
import { useHentAlleBegrunnelser } from '@hooks/useHentAlleBegrunnelser';
import { renderHook, waitFor } from '@testing-library/react';
import { TestProviders } from '@testutils/testrender';
import type { AlleBegrunnelser } from '@typer/vilkår';
import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('@api/hentAlleBegrunnelser');

afterEach(() => {
    vi.clearAllMocks();
});

const alleBegrunnelser = {} as AlleBegrunnelser;

describe('useHentAlleBegrunnelser', () => {
    test('henter alle begrunnelser', async () => {
        // Arrange
        vi.mocked(hentAlleBegrunnelser).mockResolvedValue(alleBegrunnelser);

        const { result } = renderHook(() => useHentAlleBegrunnelser(), {
            wrapper: TestProviders,
        });

        // Assert
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(hentAlleBegrunnelser).toHaveBeenCalledTimes(1);
        expect(result.current.data).toEqual(alleBegrunnelser);
    });

    test('skal sette isError dersom hentAlleBegrunnelser feiler', async () => {
        // Arrange
        vi.mocked(hentAlleBegrunnelser).mockRejectedValueOnce(new Error('Noe gikk galt'));

        const { result } = renderHook(() => useHentAlleBegrunnelser(), {
            wrapper: TestProviders,
        });

        // Assert
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe('Noe gikk galt');
    });
});
