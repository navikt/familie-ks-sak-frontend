import { opprettOvergangsordningAndel } from '@api/opprettOvergangsordningAndel';
import { type DefaultError, type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { IBehandling } from '@typer/behandling';

interface Parameters {
    behandlingId: number;
}

type Options = Omit<UseMutationOptions<IBehandling, DefaultError, Parameters>, 'mutationFn'>;

export function useOpprettOvergangsordningAndel(options?: Options) {
    return useMutation({
        mutationFn: (parameters: Parameters) => {
            const { behandlingId } = parameters;
            return opprettOvergangsordningAndel(behandlingId);
        },
        ...options,
    });
}
