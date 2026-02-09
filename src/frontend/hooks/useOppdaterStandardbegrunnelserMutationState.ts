import { useMutationState } from '@tanstack/react-query';

import { OppdaterBegrunnelserMutationKeyFactory } from './useOppdaterBegrunnelser';

export function useOppdaterBegrunnelserMutationState(vedtaksperiodeMedBegrunnelserId: number) {
    return useMutationState({
        filters: {
            mutationKey: OppdaterBegrunnelserMutationKeyFactory.vedtaksperiodeMedBegrunnelser(
                vedtaksperiodeMedBegrunnelserId
            ),
        },
        select: mutation => mutation.state,
    }).at(-1);
}
