import { type DefaultError, useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { useHttp } from '@navikt/familie-http';

import { oppdaterBegrunnelser } from '../api/oppdaterBegrunnelser';
import type { IBehandling } from '../typer/behandling';
import type { Begrunnelse } from '../typer/vedtak';

interface Payload {
    begrunnelser: Begrunnelse[];
}

export const OppdaterBegrunnelserMutationKeyFactory = {
    vedtaksperiodeMedBegrunnelser: (vedtaksperiodeMedBegrunnelserId: number) => [
        'begrunnelser',
        vedtaksperiodeMedBegrunnelserId,
    ],
};

type Options = Omit<UseMutationOptions<IBehandling, DefaultError, Payload, unknown>, 'mutationFn'>;

export function useOppdaterBegrunnelser(vedtaksperiodeMedBegrunnelserId: number, options: Options = {}) {
    const { request } = useHttp();
    return useMutation({
        mutationFn: (payload: Payload) => {
            return oppdaterBegrunnelser(request, vedtaksperiodeMedBegrunnelserId, payload);
        },
        mutationKey: OppdaterBegrunnelserMutationKeyFactory.vedtaksperiodeMedBegrunnelser(
            vedtaksperiodeMedBegrunnelserId
        ),
        ...options,
    });
}
