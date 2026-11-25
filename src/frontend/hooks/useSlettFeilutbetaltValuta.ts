import { mutationKeys } from '@hooks/keys/mutationKeys';
import { useHttp } from '@navikt/familie-http';
import { type DefaultError, type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { IRestFeilutbetaltValuta } from '@typer/eøs-feilutbetalt-valuta';

import { slettFeilutbetaltValuta } from '../api/slettFeilutbetaltValuta';

interface Parameters {
    behandlingId: number;
    feilutbetaltValutaId: number;
}

type Options = Omit<
    UseMutationOptions<IRestFeilutbetaltValuta[], DefaultError, Parameters>,
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
