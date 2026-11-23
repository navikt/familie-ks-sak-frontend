import { hentKontantstøtteBehandlinger } from '@api/hentKontantstøtteBehandlinger';
import { queryKeys } from '@hooks/keys/queryKeys';
import { MetaKey } from '@hooks/meta/metaKey';
import type { VisningBehandling } from '@sider/Fagsak/Saksoversikt/visningBehandling';
import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { lagVisningBehandling } from '@testutils/testdata/behandlingTestdata';
import { TestProviders } from '@testutils/testrender';
import { FagsakId } from '@typer/fagsak';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { useHentKontantstøttebehandlinger } from './useHentKontantstøttebehandlinger';

vi.mock('@api/hentKontantstøtteBehandlinger');

afterEach(() => {
    vi.clearAllMocks();
});

const behandlinger: VisningBehandling[] = [lagVisningBehandling()];

describe('useHentKontantstøttebehandlinger', () => {
    test('henter kontantstøttebehandlinger for fagsaken', async () => {
        // Arrange
        vi.mocked(hentKontantstøtteBehandlinger).mockResolvedValue(behandlinger);

        // Act
        const { result } = renderHook(() => useHentKontantstøttebehandlinger(FagsakId.fra(1)), {
            wrapper: TestProviders,
        });

        // Assert
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(hentKontantstøtteBehandlinger).toHaveBeenCalledWith(1);
        expect(result.current.data).toEqual(behandlinger);
    });

    test('Skal håndtere feil', async () => {
        // Arrange
        vi.mocked(hentKontantstøtteBehandlinger).mockRejectedValue(new Error('Noe gikk galt'));

        // Act
        const { result } = renderHook(() => useHentKontantstøttebehandlinger(FagsakId.fra(1)), {
            wrapper: TestProviders,
        });

        // Assert
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe('Noe gikk galt');
    });

    test('skal vise systemet laster mens forespørselen er underveis', async () => {
        // Arrange
        vi.mocked(hentKontantstøtteBehandlinger).mockResolvedValue(behandlinger);
        const queryClient = new QueryClient();

        // Act
        const { result } = renderHook(() => useHentKontantstøttebehandlinger(FagsakId.fra(1)), {
            wrapper: ({ children }) => <TestProviders queryClient={queryClient}>{children}</TestProviders>,
        });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        // Assert
        const query = queryClient
            .getQueryCache()
            .find({ queryKey: queryKeys.kontantstøttebehandlinger(FagsakId.fra(1)) });
        expect(query?.meta?.[MetaKey.VIS_SYSTEMET_LASTER]).toBe(true);
    });
});
