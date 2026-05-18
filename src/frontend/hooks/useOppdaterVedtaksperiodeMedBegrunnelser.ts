import { oppdaterVedtaksperiodeMedBegrunnelser } from '@api/oppdaterVedtaksperiodeMedBegrunnelser';
import { type DefaultError, useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { IBehandling } from '@typer/behandling';
import type { Begrunnelse } from '@typer/vedtak';

import { useHttp } from '@navikt/familie-http';

interface Parameters {
    begrunnelser: Begrunnelse[];
}

export const OppdaterVedtaksperiodeMedBegrunnelserMutationKeyFactory = {
    vedtaksperiodeMedBegrunnelser: (vedtaksperiodeMedBegrunnelserId: number) => [
        'vedtaksperiodeMedBegrunnelser',
        vedtaksperiodeMedBegrunnelserId,
    ],
};

type Options = Omit<UseMutationOptions<IBehandling, DefaultError, Parameters>, 'mutationFn'>;

export function useOppdaterVedtaksperiodeMedBegrunnelser(vedtaksperiodeMedBegrunnelserId: number, options?: Options) {
    const { request } = useHttp();
    return useMutation({
        mutationFn: (parameters: Parameters) => {
            const { begrunnelser } = parameters;
            const payload = { begrunnelser };
            return oppdaterVedtaksperiodeMedBegrunnelser(request, vedtaksperiodeMedBegrunnelserId, payload);
        },
        mutationKey: OppdaterVedtaksperiodeMedBegrunnelserMutationKeyFactory.vedtaksperiodeMedBegrunnelser(
            vedtaksperiodeMedBegrunnelserId
        ),
        ...options,
    });
}
