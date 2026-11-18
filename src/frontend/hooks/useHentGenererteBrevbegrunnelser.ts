import { hentGenererteBrevbegrunnelser } from '@api/hentGenererteBrevbegrunnelser';
import { queryKeys } from '@hooks/keys/queryKeys';
import { useHttp } from '@navikt/familie-http';
import { type DefaultError, type UseQueryOptions, useQuery } from '@tanstack/react-query';

type Options = Omit<UseQueryOptions<string[], DefaultError, string[]>, 'queryKey' | 'queryFn' | 'select'>;

export function useHentGenererteBrevbegrunnelser(behandlingId: number, vedtaksperiodeId: number, options?: Options) {
    const { request } = useHttp();
    return useQuery({
        queryKey: queryKeys.genererteBrevbegrunnelser(behandlingId, vedtaksperiodeId),
        queryFn: () => hentGenererteBrevbegrunnelser(request, vedtaksperiodeId),
        select: data => data.toSorted(),
        ...options,
    });
}
