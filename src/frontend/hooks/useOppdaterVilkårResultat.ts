import { oppdaterVilkårResultat } from '@api/oppdaterVilkårResultat';
import { type DefaultError, useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { IBehandling } from '@typer/behandling';
import type { IEndreVilkårResultat } from '@typer/vilkår';

interface Parameters {
    behandlingId: number;
    endreVilkårResultat: IEndreVilkårResultat;
}

type Options = Omit<UseMutationOptions<IBehandling, DefaultError, Parameters>, 'mutationFn'>;

export function useOppdaterVilkårResultat(options?: Options) {
    return useMutation({
        mutationFn: ({ behandlingId, endreVilkårResultat }: Parameters) =>
            oppdaterVilkårResultat(behandlingId, endreVilkårResultat),
        ...options,
    });
}
