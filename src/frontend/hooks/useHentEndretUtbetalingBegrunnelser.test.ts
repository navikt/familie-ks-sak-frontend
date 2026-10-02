import { hentEndretUtbetalingBegrunnelser } from '@api/hentEndretUtbetalingBegrunnelser';
import { renderHook, waitFor } from '@testing-library/react';
import { TestProviders } from '@testutils/testrender';
import type { EndringsårsakbegrunnelseTekster } from '@typer/endretUtbetaling';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { useHentEndretUtbetalingBegrunnelser } from './useHentEndretUtbetalingBegrunnelser';

vi.mock('@api/hentEndretUtbetalingBegrunnelser');

afterEach(() => {
    vi.clearAllMocks();
});

const begrunnelser = {} as EndringsårsakbegrunnelseTekster;

describe('useHentEndretUtbetalingBegrunnelser', () => {
    test('henter begrunnelser for endret utbetaling', async () => {
        // Arrange
        vi.mocked(hentEndretUtbetalingBegrunnelser).mockResolvedValue(begrunnelser);

        const { result } = renderHook(() => useHentEndretUtbetalingBegrunnelser(), { wrapper: TestProviders });

        // Assert
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(hentEndretUtbetalingBegrunnelser).toHaveBeenCalledTimes(1);
        expect(result.current.data).toEqual(begrunnelser);
    });

    test('skal sette isError dersom hentEndretUtbetalingBegrunnelser feiler', async () => {
        // Arrange
        vi.mocked(hentEndretUtbetalingBegrunnelser).mockRejectedValueOnce(new Error('Noe gikk galt'));

        const { result } = renderHook(() => useHentEndretUtbetalingBegrunnelser(), { wrapper: TestProviders });

        // Assert
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe('Noe gikk galt');
    });
});
