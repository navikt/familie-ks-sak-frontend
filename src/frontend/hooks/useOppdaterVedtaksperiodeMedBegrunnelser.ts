import { oppdaterVedtaksperiodeMedBegrunnelser } from '@api/oppdaterVedtaksperiodeMedBegrunnelser';
import { type DefaultError, useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { Begrunnelse } from '@typer/vedtak';
import type { IVedtaksperiodeMedBegrunnelser } from '@typer/vedtaksperiode';

export const OppdaterVedtaksperiodeMedBegrunnelserMutationKeyFactory = {
    vedtaksperiodeMedBegrunnelser: (vedtaksperiodeMedBegrunnelserId: number) => [
        'vedtaksperiodeMedBegrunnelser',
        vedtaksperiodeMedBegrunnelserId,
    ],
};

type Options = Omit<UseMutationOptions<IVedtaksperiodeMedBegrunnelser[], DefaultError, Parameters>, 'mutationFn'>;

interface Parameters {
    begrunnelser: Begrunnelse[];
}

export function useOppdaterVedtaksperiodeMedBegrunnelser(vedtaksperiodeMedBegrunnelserId: number, options?: Options) {
    return useMutation({
        mutationFn: (parameters: Parameters) => {
            const { begrunnelser } = parameters;
            return oppdaterVedtaksperiodeMedBegrunnelser(vedtaksperiodeMedBegrunnelserId, { begrunnelser });
        },
        mutationKey: OppdaterVedtaksperiodeMedBegrunnelserMutationKeyFactory.vedtaksperiodeMedBegrunnelser(
            vedtaksperiodeMedBegrunnelserId
        ),
        ...options,
    });
}
