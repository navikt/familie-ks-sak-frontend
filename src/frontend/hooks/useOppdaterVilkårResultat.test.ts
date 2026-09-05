import { oppdaterVilkårResultat } from '@api/oppdaterVilkårResultat';
import { renderHook, waitFor } from '@testing-library/react';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { lagVilkårResultat } from '@testutils/testdata/vilkårResultatTestdata';
import { TestProviders } from '@testutils/testrender';
import type { IEndreVilkårResultat } from '@typer/vilkår';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { useOppdaterVilkårResultat } from './useOppdaterVilkårResultat';

vi.mock('@api/oppdaterVilkårResultat');

afterEach(() => {
    vi.clearAllMocks();
});

const endreVilkårResultat: IEndreVilkårResultat = {
    personIdent: '12345678910',
    endretVilkårResultat: lagVilkårResultat({ id: 7 }),
};

describe('useOppdaterVilkårResultat', () => {
    test('kaller oppdaterVilkårResultat med behandlingId og payload', async () => {
        // Arrange
        const behandling = lagBehandling({ behandlingId: 123 });
        vi.mocked(oppdaterVilkårResultat).mockResolvedValue(behandling);

        const { result } = renderHook(() => useOppdaterVilkårResultat(), { wrapper: TestProviders });

        // Act
        result.current.mutate({ behandlingId: 123, endreVilkårResultat });

        // Assert
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(oppdaterVilkårResultat).toHaveBeenCalledWith(123, endreVilkårResultat);
        expect(result.current.data).toEqual(behandling);
    });

    test('Skal håndtere feil', async () => {
        // Arrange
        vi.mocked(oppdaterVilkårResultat).mockRejectedValue(new Error('Noe gikk galt'));

        const { result } = renderHook(() => useOppdaterVilkårResultat(), { wrapper: TestProviders });

        // Act
        result.current.mutate({ behandlingId: 123, endreVilkårResultat });

        // Assert
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe('Noe gikk galt');
    });
});
