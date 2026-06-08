import { oppdaterSammensattKontrollsak } from '@api/oppdaterSammensattKontrollsak';
import { type DefaultError, useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { OppdaterSammensattKontrollsakDto, SammensattKontrollsakDto } from '@typer/sammensatt-kontrollsak';

type Parameters = OppdaterSammensattKontrollsakDto;

type Options = Omit<UseMutationOptions<SammensattKontrollsakDto, DefaultError, Parameters>, 'mutationFn'>;

export function useOppdaterSammensattKontrollsak(options?: Options) {
    return useMutation({
        mutationFn: (parameters: Parameters) => oppdaterSammensattKontrollsak(parameters),
        ...options,
    });
}
