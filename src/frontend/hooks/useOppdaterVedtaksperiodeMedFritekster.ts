import { oppdaterVedtaksperiodeMedFritekster } from '@api/oppdaterVedtaksperiodeMedFritekster';
import { type DefaultError, useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { IVedtaksperiodeMedBegrunnelser } from '@typer/vedtaksperiode';

export const OppdaterVedtaksperiodeMedFriteksterMutationKeyFactory = {
    vedtaksperiodeMedFritekster: (vedtaksperiodeMedBegrunnelserId: number) => [
        'vedtaksperioderMedFritekster',
        vedtaksperiodeMedBegrunnelserId,
    ],
};

type Options = Omit<UseMutationOptions<IVedtaksperiodeMedBegrunnelser[], DefaultError, Parameters>, 'mutationFn'>;

interface Parameters {
    fritekster: string[];
}

export function useOppdaterVedtaksperiodeMedFritekster(vedtaksperiodeMedBegrunnelserId: number, options?: Options) {
    return useMutation({
        mutationFn: (parameters: Parameters) => {
            const { fritekster } = parameters;
            return oppdaterVedtaksperiodeMedFritekster(vedtaksperiodeMedBegrunnelserId, { fritekster });
        },
        mutationKey: OppdaterVedtaksperiodeMedFriteksterMutationKeyFactory.vedtaksperiodeMedFritekster(
            vedtaksperiodeMedBegrunnelserId
        ),
        ...options,
    });
}
