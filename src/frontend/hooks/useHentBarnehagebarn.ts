import { useQuery } from '@tanstack/react-query';

import { useHttp } from '@navikt/familie-http';

import { hentBarnehagebarn } from '../api/hentBarnehagebarn';
import type { BarnehagebarnRequestParams } from '../typer/barnehagebarn';

export const HentBarnehagebarnQueryKeyFactory = {
    barnehagebarn: (barnehagebarnRequestParams: BarnehagebarnRequestParams) => [
        'barnehagebarn',
        barnehagebarnRequestParams,
    ],
};

export function useHentBarnehagebarn(barnehagebarnRequestParams: BarnehagebarnRequestParams) {
    const { request } = useHttp();
    return useQuery({
        queryKey: HentBarnehagebarnQueryKeyFactory.barnehagebarn(barnehagebarnRequestParams),
        queryFn: () => hentBarnehagebarn(request, barnehagebarnRequestParams),
    });
}
