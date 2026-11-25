import { queryKeys } from '@hooks/keys/queryKeys';
import { useHttp } from '@navikt/familie-http';
import { useQuery } from '@tanstack/react-query';

import { hentBarnehagebarn } from '../api/hentBarnehagebarn';
import type { BarnehagebarnRequestParams } from '../typer/barnehagebarn';

export function useHentBarnehagebarn(barnehagebarnRequestParams: BarnehagebarnRequestParams) {
    const { request } = useHttp();
    return useQuery({
        queryKey: queryKeys.barnehagebarn(barnehagebarnRequestParams),
        queryFn: () => hentBarnehagebarn(request, barnehagebarnRequestParams),
    });
}
