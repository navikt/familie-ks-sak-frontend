import { mutationKeys } from '@hooks/keys/mutationKeys';
import { useHttp } from '@navikt/familie-http';
import { type DefaultError, type UseMutationOptions, useMutation } from '@tanstack/react-query';

import { slettFeilutbetaltValuta } from '../api/slettFeilutbetaltValuta';
import type { IBehandling } from '../typer/behandling';

interface Parameters {
    behandlingId: number;
    feilutbetaltValutaId: number;
}

type Options = Omit<
    UseMutationOptions<IBehandling, DefaultError, Parameters, unknown>,
    'mutationKey' | 'mutationFn'
> & {
    feilutbetaltValutaId: number;
};

export function useSlettFeilutbetaltValuta(options: Options) {
    const { feilutbetaltValutaId, ...rest } = options;
    const { request } = useHttp();
    return useMutation({
        mutationKey: mutationKeys.slettFeilutbetaltValuta(feilutbetaltValutaId),
        mutationFn: (parameters: Parameters) => {
            const { behandlingId, feilutbetaltValutaId } = parameters;
            return slettFeilutbetaltValuta(request, behandlingId, feilutbetaltValutaId);
        },
        ...rest,
    });
}
