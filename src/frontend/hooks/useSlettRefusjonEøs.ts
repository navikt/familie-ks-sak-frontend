import { mutationKeys } from '@hooks/keys/mutationKeys';
import { useHttp } from '@navikt/familie-http';
import { type DefaultError, type UseMutationOptions, useMutation } from '@tanstack/react-query';

import { slettRefusjonEøs } from '../api/slettRefusjonEøs';
import type { IBehandling } from '../typer/behandling';

interface Parameters {
    behandlingId: number;
    refusjonEøsId: number;
}

type Options = Omit<
    UseMutationOptions<IBehandling, DefaultError, Parameters, unknown>,
    'mutationKey' | 'mutationFn'
> & {
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
