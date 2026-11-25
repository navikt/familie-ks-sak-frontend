import { oppdaterVedtaksperiodeMedBegrunnelser } from '@api/oppdaterVedtaksperiodeMedBegrunnelser';
import { mutationKeys } from '@hooks/keys/mutationKeys';
import { type DefaultError, type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { Begrunnelse } from '@typer/vedtak';
import type { IVedtaksperiodeMedBegrunnelser } from '@typer/vedtaksperiode';

type Options = Omit<
    UseMutationOptions<IVedtaksperiodeMedBegrunnelser[], DefaultError, Parameters>,
    'mutationKey' | 'mutationFn'
>;

interface Parameters {
    begrunnelser: Begrunnelse[];
}

export function useOppdaterVedtaksperiodeMedBegrunnelser(vedtaksperiodeMedBegrunnelserId: number, options?: Options) {
    return useMutation({
        mutationFn: (parameters: Parameters) => {
            const { begrunnelser } = parameters;
            return oppdaterVedtaksperiodeMedBegrunnelser(vedtaksperiodeMedBegrunnelserId, { begrunnelser });
        },
        mutationKey: mutationKeys.oppdaterVedtaksperiodeMedBegrunnelser(vedtaksperiodeMedBegrunnelserId),
        ...options,
    });
}
