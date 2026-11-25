import { hentBydeler } from '@api/hentBydeler';
import { queryKeys } from '@hooks/keys/queryKeys';
import { useQuery } from '@tanstack/react-query';

export function useHentBydeler() {
    return useQuery({
        queryKey: queryKeys.bydeler(),
        queryFn: () => hentBydeler(),
    });
}
