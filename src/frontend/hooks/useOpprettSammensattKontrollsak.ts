import { opprettSammensattKontrollsak } from '@api/opprettSammensattKontrollsak';
import { mutationKeys } from '@hooks/keys/mutationKeys';
import { type DefaultError, type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { OpprettSammensattKontrollsakDto, SammensattKontrollsakDto } from '@typer/sammensatt-kontrollsak';

type Parameters = OpprettSammensattKontrollsakDto;

type Options = Omit<
    UseMutationOptions<SammensattKontrollsakDto, DefaultError, Parameters>,
    'mutationKey' | 'mutationFn'
>;

export function useOpprettSammensattKontrollsak(behandlingId: number, options?: Options) {
    return useMutation({
        mutationKey: mutationKeys.opprettSammensattKontrollsak(behandlingId),
        mutationFn: (parameters: Parameters) => opprettSammensattKontrollsak(parameters),
        ...options,
    });
}
