import { låsOppFagsak, type LåsOppFagsakPayload } from '@api/låsOppFagsak';
import { type DefaultError, useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { IMinimalFagsak } from '@typer/fagsak';

type Parameters = LåsOppFagsakPayload;

type Options = Omit<UseMutationOptions<IMinimalFagsak, DefaultError, Parameters>, 'mutationKey' | 'mutationFn'>;

export const LåsOppFagsakMutationKeyFactory = {
    låsOppFagsak: (fagsakId: number) => ['låsOppFagsak', fagsakId],
};

export function useLåsOppFagsak(fagsakId: number, options?: Options) {
    return useMutation({
        mutationKey: LåsOppFagsakMutationKeyFactory.låsOppFagsak(fagsakId),
        mutationFn: (parameters: Parameters) => låsOppFagsak(fagsakId, parameters),
        ...options,
    });
}
