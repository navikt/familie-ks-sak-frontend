import { hentKlagebehandlinger } from '@api/hentKlagebehandlinger';
import { MetaKey } from '@hooks/meta/metaKey';
import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { lagKlagebehandling } from '@testutils/testdata/klageTestdata';
import { TestProviders } from '@testutils/testrender';
import type { IKlagebehandling } from '@typer/klage';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { HentKlagebehandlingerQueryKeyFactory, useHentKlagebehandlinger } from './useHentKlagebehandlinger';

vi.mock('@api/hentKlagebehandlinger');

afterEach(() => {
    vi.clearAllMocks();
});

const klagebehandlinger: IKlagebehandling[] = [lagKlagebehandling()];

describe('useHentKlagebehandlinger', () => {
    test('henter klagebehandlinger for fagsaken', async () => {
        // Arrange
        vi.mocked(hentKlagebehandlinger).mockResolvedValue(klagebehandlinger);

        // Act
        const { result } = renderHook(() => useHentKlagebehandlinger(1), {
            wrapper: TestProviders,
        });

        // Assert
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(hentKlagebehandlinger).toHaveBeenCalledWith(1);
        expect(result.current.data).toEqual(klagebehandlinger);
    });

    test('Skal håndtere feil', async () => {
        // Arrange
        vi.mocked(hentKlagebehandlinger).mockRejectedValue(new Error('Noe gikk galt'));

        // Act
        const { result } = renderHook(() => useHentKlagebehandlinger(1), {
            wrapper: TestProviders,
        });

        // Assert
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe('Noe gikk galt');
    });

    test('skal vise systemet laster mens forespørselen er underveis', async () => {
        // Arrange
        vi.mocked(hentKlagebehandlinger).mockResolvedValue(klagebehandlinger);
        const queryClient = new QueryClient();

        // Act
        const { result } = renderHook(() => useHentKlagebehandlinger(1), {
            wrapper: ({ children }) => <TestProviders queryClient={queryClient}>{children}</TestProviders>,
        });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        // Assert
        const query = queryClient
            .getQueryCache()
            .find({ queryKey: HentKlagebehandlingerQueryKeyFactory.klagebehandlinger(1) });
        expect(query?.meta?.[MetaKey.VIS_SYSTEMET_LASTER]).toBe(true);
    });
});
