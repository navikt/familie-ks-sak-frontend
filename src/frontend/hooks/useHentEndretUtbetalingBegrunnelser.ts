import { hentEndretUtbetalingBegrunnelser } from '@api/hentEndretUtbetalingBegrunnelser';
import { useQuery } from '@tanstack/react-query';

export const HentEndretUtbetalingBegrunnelserQueryKeyFactory = {
    endretUtbetalingBegrunnelser: () => ['endretUtbetalingBegrunnelser'],
};

export function useHentEndretUtbetalingBegrunnelser() {
    return useQuery({
        queryKey: HentEndretUtbetalingBegrunnelserQueryKeyFactory.endretUtbetalingBegrunnelser(),
        queryFn: () => hentEndretUtbetalingBegrunnelser(),
    });
}
