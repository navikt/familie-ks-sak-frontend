import { useHttp } from '@navikt/familie-http';
import { type DefaultError, type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { IRestFeilutbetaltValuta } from '@typer/eøs-feilutbetalt-valuta';

import { type OpprettFeilutbetaltValutaPayload, opprettFeilutbetaltValuta } from '../api/opprettFeilutbetaltValuta';

interface Parameters {
    behandlingId: number;
    payload: OpprettFeilutbetaltValutaPayload;
}

type Options = Omit<UseMutationOptions<IRestFeilutbetaltValuta[], DefaultError, Parameters>, 'mutationFn'>;

export function useOpprettFeilutbetaltValuta(options: Options = {}) {
    const { request } = useHttp();
    return useMutation({
        mutationFn: (parameters: Parameters) => {
            const { behandlingId, payload } = parameters;
            return opprettFeilutbetaltValuta(request, behandlingId, payload);
        },
        ...options,
    });
}
