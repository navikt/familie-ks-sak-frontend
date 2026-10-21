import { useHttp } from '@navikt/familie-http';
import { useQuery } from '@tanstack/react-query';

import { hentBydeler } from '../api/hentBydeler';

export const HentBydelerQueryKeyFactory = {
    bydeler: () => ['bydeler'],
};

export function useHentBydeler() {
    const { request } = useHttp();
    return useQuery({
        queryKey: HentBydelerQueryKeyFactory.bydeler(),
        queryFn: () => hentBydeler(request),
        staleTime: Infinity,
    });
}
