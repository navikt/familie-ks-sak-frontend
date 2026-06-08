import { opprettSammensattKontrollsak } from '@api/opprettSammensattKontrollsak';
import { type DefaultError, useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { OpprettSammensattKontrollsakDto, SammensattKontrollsakDto } from '@typer/sammensatt-kontrollsak';

type Parameters = OpprettSammensattKontrollsakDto;

type Options = Omit<
    UseMutationOptions<SammensattKontrollsakDto, DefaultError, Parameters>,
    'mutationKey' | 'mutationFn'
>;

export const OpprettSammensattKontrollsakMutationKeyFactory = {
    opprettSammensattKontrollsak: (behandlingId: number) => ['opprettSammensattKontrollsak', behandlingId],
};

export function useOpprettSammensattKontrollsak(behandlingId: number, options?: Options) {
    return useMutation({
        mutationKey: OpprettSammensattKontrollsakMutationKeyFactory.opprettSammensattKontrollsak(behandlingId),
        mutationFn: (parameters: Parameters) => opprettSammensattKontrollsak(parameters),
        ...options,
    });
}
