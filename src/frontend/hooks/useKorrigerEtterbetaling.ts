import { useHttp } from '@navikt/familie-http';
import { type DefaultError, type UseMutationOptions, useMutation } from '@tanstack/react-query';

import { type KorrigerEtterbetalingPayload, korrigerEtterbetaling } from '../api/korrigerEtterbetaling';
import type { IRestKorrigertEtterbetaling } from '../typer/vedtak';

type Options = Omit<
    UseMutationOptions<IRestKorrigertEtterbetaling, DefaultError, KorrigerEtterbetalingParameters>,
    'mutationFn'
>;

interface KorrigerEtterbetalingParameters extends KorrigerEtterbetalingPayload {
    behandlingId: number;
}

export function useKorrigerEtterbetaling(options?: Options) {
    const { request } = useHttp();

    return useMutation<IRestKorrigertEtterbetaling, Error, KorrigerEtterbetalingParameters>({
        mutationFn: (parameters: KorrigerEtterbetalingParameters): Promise<IRestKorrigertEtterbetaling> => {
            const { årsak, beløp, begrunnelse, behandlingId } = parameters;
            const payload = { årsak, beløp, begrunnelse };
            return korrigerEtterbetaling(request, payload, behandlingId);
        },
        ...options,
    });
}
