import { type LåsOppFagsakPayload, låsOppFagsak } from '@api/låsOppFagsak';
import { mutationKeys } from '@hooks/keys/mutationKeys';
import { type DefaultError, type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { IMinimalFagsak } from '@typer/fagsak';

type Parameters = LåsOppFagsakPayload;

type Options = Omit<UseMutationOptions<IMinimalFagsak, DefaultError, Parameters>, 'mutationKey' | 'mutationFn'>;

export function useLåsOppFagsak(fagsakId: number, options?: Options) {
    return useMutation({
        mutationKey: mutationKeys.låsOppFagsak(fagsakId),
        mutationFn: (parameters: Parameters) => låsOppFagsak(fagsakId, parameters),
        ...options,
    });
}
