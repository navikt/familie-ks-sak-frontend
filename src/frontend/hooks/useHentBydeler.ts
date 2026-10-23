import { hentBydeler } from '@api/hentBydeler';
import { useQuery } from '@tanstack/react-query';

export const HentBydelerQueryKeyFactory = {
    bydeler: () => ['bydeler'],
};

export function useHentBydeler() {
    return useQuery({
        queryKey: HentBydelerQueryKeyFactory.bydeler(),
        queryFn: () => hentBydeler(),
    });
}
