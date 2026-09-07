import { hentTilbakekrevingsbehandlinger } from '@api/hentTilbakekrevingsbehandlinger';
import { MetaKey } from '@hooks/meta/metaKey';
import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { lagTilbakekrevingbehandling } from '@testutils/testdata/tilbakekrevingTestdata';
import { TestProviders } from '@testutils/testrender';
import type { ITilbakekrevingsbehandling } from '@typer/tilbakekrevingsbehandling';
import { afterEach, describe, expect, test, vi } from 'vitest';

import {
    HentTilbakekrevingsbehandlingerQueryKeyFactory,
    useHentTilbakekrevingsbehandlinger,
} from './useHentTilbakekrevingsbehandlinger';

vi.mock('@api/hentTilbakekrevingsbehandlinger');

afterEach(() => {
    vi.clearAllMocks();
});

const tilbakekrevingsbehandlinger: ITilbakekrevingsbehandling[] = [lagTilbakekrevingbehandling()];

describe('useHentTilbakekrevingsbehandlinger', () => {
    test('henter tilbakekrevingsbehandlinger for fagsaken', async () => {
        // Arrange
        vi.mocked(hentTilbakekrevingsbehandlinger).mockResolvedValue(tilbakekrevingsbehandlinger);

        // Act
        const { result } = renderHook(() => useHentTilbakekrevingsbehandlinger(1), {
            wrapper: TestProviders,
        });

        // Assert
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(hentTilbakekrevingsbehandlinger).toHaveBeenCalledWith(1);
        expect(result.current.data).toEqual(tilbakekrevingsbehandlinger);
    });

    test('Skal håndtere feil', async () => {
        // Arrange
        vi.mocked(hentTilbakekrevingsbehandlinger).mockRejectedValue(new Error('Noe gikk galt'));

        // Act
        const { result } = renderHook(() => useHentTilbakekrevingsbehandlinger(1), {
            wrapper: TestProviders,
        });

        // Assert
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe('Noe gikk galt');
    });

    test('skal vise systemet laster mens forespørselen er underveis', async () => {
        // Arrange
        vi.mocked(hentTilbakekrevingsbehandlinger).mockResolvedValue(tilbakekrevingsbehandlinger);
        const queryClient = new QueryClient();

        // Act
        const { result } = renderHook(() => useHentTilbakekrevingsbehandlinger(1), {
            wrapper: ({ children }) => <TestProviders queryClient={queryClient}>{children}</TestProviders>,
        });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        // Assert
        const query = queryClient
            .getQueryCache()
            .find({ queryKey: HentTilbakekrevingsbehandlingerQueryKeyFactory.tilbakekrevingsbehandlinger(1) });
        expect(query?.meta?.[MetaKey.VIS_SYSTEMET_LASTER]).toBe(true);
    });
});
