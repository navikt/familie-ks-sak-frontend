import { useHttp } from '@navikt/familie-http';
import { type DefaultError, type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { IRestRefusjonEøs } from '@typer/refusjon-eøs';

import { type OpprettRefusjonEøsPayload, opprettRefusjonEøs } from '../api/opprettRefusjonEøs';

interface Parameters {
    behandlingId: number;
    payload: OpprettRefusjonEøsPayload;
}

type Options = Omit<UseMutationOptions<IRestRefusjonEøs[], DefaultError, Parameters>, 'mutationFn'>;

export function useOpprettRefusjonEøs(options: Options = {}) {
    const { request } = useHttp();
    return useMutation({
        mutationFn: (parameters: Parameters) => {
            const { behandlingId, payload } = parameters;
            return opprettRefusjonEøs(request, behandlingId, payload);
        },
        ...options,
    });
}
