import { slettSammensattKontrollsak } from '@api/slettSammensattKontrollsak';
import { type DefaultError, type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { SammensattKontrollsakDto } from '@typer/sammensatt-kontrollsak';

type Options = Omit<UseMutationOptions<number, DefaultError, SammensattKontrollsakDto>, 'mutationKey' | 'mutationFn'>;

export const SlettSammensattKontrollsakMutationKeyFactory = {
    slettSammensattKontrollsak: (behandlingId: number) => ['slettSammensattKontrollsak', behandlingId],
};

export function useSlettSammensattKontrollsak(behandlingId: number, options?: Options) {
    return useMutation({
        mutationKey: SlettSammensattKontrollsakMutationKeyFactory.slettSammensattKontrollsak(behandlingId),
        mutationFn: (sammensattKontrollsak: SammensattKontrollsakDto) =>
            slettSammensattKontrollsak({ id: sammensattKontrollsak.id }),
        ...options,
    });
}
