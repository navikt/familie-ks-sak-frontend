import { henleggBehandling, type HenleggBehandlingPayload } from '@api/henleggBehandling';
import { type DefaultError, useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { IBehandling } from '@typer/behandling';

interface Parameters extends HenleggBehandlingPayload {
    behandling: IBehandling;
}

type Options = Omit<UseMutationOptions<IBehandling, DefaultError, Parameters, unknown>, 'mutationFn'>;

export function useHenleggBehandling(options?: Options) {
    return useMutation({
        mutationFn: (parameters: Parameters) => {
            const { behandling, årsak, begrunnelse } = parameters;
            const payload = { årsak, begrunnelse };
            return henleggBehandling(behandling, payload);
        },
        ...options,
    });
}
