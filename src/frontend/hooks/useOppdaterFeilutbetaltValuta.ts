import { useHttp } from '@navikt/familie-http';
import { type DefaultError, type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { IRestFeilutbetaltValuta } from '@typer/eøs-feilutbetalt-valuta';

import { type OppdaterFeilutbetaltValutaPayload, oppdaterFeilutbetaltValuta } from '../api/oppdaterFeilutbetaltValuta';

interface Parameters {
    behandlingId: number;
    feilutbetaltValutaId: number;
    payload: OppdaterFeilutbetaltValutaPayload;
}

type Options = Omit<UseMutationOptions<IRestFeilutbetaltValuta[], DefaultError, Parameters>, 'mutationFn'>;

export function useOppdaterFeilutbetaltValuta(options: Options = {}) {
    const { request } = useHttp();
    return useMutation({
        mutationFn: (parameters: Parameters) => {
            const { behandlingId, feilutbetaltValutaId, payload } = parameters;
            return oppdaterFeilutbetaltValuta(request, behandlingId, feilutbetaltValutaId, payload);
        },
        ...options,
    });
}
