import { låsOppFagsak, type LåsOppFagsakPayload } from '@api/låsOppFagsak';
import { type DefaultError, useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { IMinimalFagsak } from '@typer/fagsak';

interface Parameters extends LåsOppFagsakPayload {
    fagsakId: number;
}

type Options = Omit<UseMutationOptions<IMinimalFagsak, DefaultError, Parameters>, 'mutationFn'>;

export function useLåsOppFagsak(options?: Options) {
    return useMutation({
        mutationFn: (parameters: Parameters) => {
            const { fagsakId, begrunnelse } = parameters;
            return låsOppFagsak(fagsakId, { begrunnelse });
        },
        ...options,
    });
}
