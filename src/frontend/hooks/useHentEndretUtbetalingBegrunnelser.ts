import { hentEndretUtbetalingBegrunnelser } from '@api/hentEndretUtbetalingBegrunnelser';
import { queryKeys } from '@hooks/keys/queryKeys';
import { useQuery } from '@tanstack/react-query';

export function useHentEndretUtbetalingBegrunnelser() {
    return useQuery({
        queryKey: queryKeys.endretUtbetalingBegrunnelser(),
        queryFn: () => hentEndretUtbetalingBegrunnelser(),
    });
}
