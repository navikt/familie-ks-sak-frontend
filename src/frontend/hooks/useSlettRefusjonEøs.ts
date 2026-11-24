import { mutationKeys } from '@hooks/keys/mutationKeys';
import { useHttp } from '@navikt/familie-http';
import { type DefaultError, type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { IRestRefusjonEøs } from '@typer/refusjon-eøs';

import { slettRefusjonEøs } from '../api/slettRefusjonEøs';

interface Parameters {
    behandlingId: number;
    refusjonEøsId: number;
}

type Options = Omit<UseMutationOptions<IRestRefusjonEøs[], DefaultError, Parameters>, 'mutationKey' | 'mutationFn'> & {
    refusjonEøsId: number;
};

export function useSlettRefusjonEøs(options: Options) {
    const { refusjonEøsId, ...rest } = options;
    const { request } = useHttp();
    return useMutation({
        mutationKey: mutationKeys.slettRefusjonEøs(refusjonEøsId),
        mutationFn: (parameters: Parameters) => {
            const { behandlingId, refusjonEøsId } = parameters;
            return slettRefusjonEøs(request, behandlingId, refusjonEøsId);
        },
        ...rest,
    });
}
