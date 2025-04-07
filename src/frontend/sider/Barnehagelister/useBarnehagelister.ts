import { useEffect, useMemo, useState } from 'react';

import type { AxiosError } from 'axios';

import { useHttp } from '@navikt/familie-http';
import {
    byggFeiletRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    type Ressurs,
    RessursStatus,
} from '@navikt/familie-typer';

import type {
    Barnehagebarn,
    BarnehagebarnFilter,
    BarnehagebarnRequestParams,
    BarnehagebarnResponse,
    Barnehagekommune,
} from '../../typer/barnehagebarn';

const defaultBarnehagebarnRequestParams: BarnehagebarnRequestParams = {
    ident: '',
    kommuneNavn: '',
    kunLøpendeAndel: false,
    limit: 20,
    offset: 0,
    sortBy: 'kommuneNavn',
    sortAsc: false,
};

export interface BarnehagebarnContext<T> {
    barnehagebarnRequestParams: BarnehagebarnRequestParams;
    barnehagebarnResponse: Ressurs<BarnehagebarnResponse<T>>;
    data: readonly T[];
    updateOffset: (offset: number) => void;
    updateLimit: (limit: number) => void;
    updateSortByAscDesc: (fieldName: string) => void;
    oppdaterFiltrering: (filter: BarnehagebarnFilter) => void;
    barnehageKommuner: () => Barnehagekommune[];
}

const BARNEHAGEKOMMUNER_URL = '/familie-ks-sak/api/barnehagebarn/barnehagekommuner';

export const useBarnehagelister = <T = Barnehagebarn>(
    barnehagebarn_url: string
): BarnehagebarnContext<T> => {
    const { request } = useHttp();

    const [barnehagebarnRequestParams, settBarnehagebarnRequestParams] =
        useState<BarnehagebarnRequestParams>({ ...defaultBarnehagebarnRequestParams });

    const [barnehagebarnResponse, settBarnehagebarnResponse] =
        useState<Ressurs<BarnehagebarnResponse<T>>>(byggTomRessurs<BarnehagebarnResponse<T>>());

    const [barnehagekommunerRessurs, settBarnehagekommunerRessurs] =
        useState<Ressurs<Barnehagekommune[]>>(byggTomRessurs<Barnehagekommune[]>());

    const data: ReadonlyArray<T> = useMemo(() => {
        return barnehagebarnResponse.status === RessursStatus.SUKSESS &&
            barnehagebarnResponse.data.content.length > 0
            ? barnehagebarnResponse.data.content
            : [];
    }, [barnehagebarnResponse]);

    const hentBarnehagebarnResponseRessurs = () => {
        settBarnehagebarnResponse(byggHenterRessurs());
        request<BarnehagebarnRequestParams, BarnehagebarnResponse<T>>({
            data: barnehagebarnRequestParams,
            method: 'POST',
            url: `${barnehagebarn_url}`,
        })
            .then((barnehagebarnResponseRessurs: Ressurs<BarnehagebarnResponse<T>>) => {
                settBarnehagebarnResponse(barnehagebarnResponseRessurs);
            })
            .catch((_error: AxiosError) => {
                return byggFeiletRessurs('Ukjent feil ved innhenting av barnehageliste ks-sak');
            });
    };

    const hentAlleKommuner = () => {
        settBarnehagekommunerRessurs(byggHenterRessurs());
        request<void, Barnehagekommune[]>({
            method: 'GET',
            url: BARNEHAGEKOMMUNER_URL,
        })
            .then((barnehageKommuner: Ressurs<Barnehagekommune[]>) => {
                settBarnehagekommunerRessurs(barnehageKommuner);
            })
            .catch((_error: AxiosError) => {
                settBarnehagekommunerRessurs(
                    byggFeiletRessurs('Ukjent feil ved innhenting av barnehagekommuner')
                );
            });
    };

    if (barnehagekommunerRessurs.status == RessursStatus.IKKE_HENTET) {
        hentAlleKommuner();
    }

    const barnehageKommuner = (): Barnehagekommune[] => {
        if (barnehagekommunerRessurs.status == RessursStatus.SUKSESS) {
            return barnehagekommunerRessurs.data;
        }
        return ['Oslo', 'Voss', 'Frogn'];
    };

    /* Pagination values */
    const updateOffset = (offset: number) => {
        if (offset !== barnehagebarnRequestParams.offset) {
            const newBarnehageRequestParams = { ...barnehagebarnRequestParams, offset: offset };
            settBarnehagebarnRequestParams(newBarnehageRequestParams);
        }
    };
    const updateLimit = (limit: number) => {
        const newBarnehageRequestParams = {
            ...barnehagebarnRequestParams,
            limit: limit,
            offset: 0,
        };
        settBarnehagebarnRequestParams(newBarnehageRequestParams);
    };

    /* Sorting values */
    const updateSortByAscDesc = (fieldName: string) => {
        let sortAscending = barnehagebarnRequestParams.sortAsc;
        if (fieldName === barnehagebarnRequestParams.sortBy) {
            sortAscending = !sortAscending;
        }
        const newBarnehageRequestParams = {
            ...barnehagebarnRequestParams,
            sortBy: fieldName,
            sortAsc: sortAscending,
        };
        settBarnehagebarnRequestParams(newBarnehageRequestParams);
    };

    // Filter values
    const oppdaterFiltrering = (oppdatertBarnehagebarnFilter: BarnehagebarnFilter) => {
        if (erBarnehagebarnFilterOppdatert(oppdatertBarnehagebarnFilter)) {
            settBarnehagebarnRequestParams({
                ...barnehagebarnRequestParams,
                offset: 0,
                ident: oppdatertBarnehagebarnFilter.ident,
                kommuneNavn: oppdatertBarnehagebarnFilter.kommuneNavn,
                kunLøpendeAndel: oppdatertBarnehagebarnFilter.kunLøpendeAndel,
            });
        }
    };

    const erBarnehagebarnFilterOppdatert = (oppdatertBarnehagebarnFilter: BarnehagebarnFilter) => {
        const barnehagebarnFilter: BarnehagebarnFilter = {
            ident: barnehagebarnRequestParams.ident,
            kommuneNavn: barnehagebarnRequestParams.kommuneNavn,
            kunLøpendeAndel: barnehagebarnRequestParams.kunLøpendeAndel,
        };
        return JSON.stringify(barnehagebarnFilter) !== JSON.stringify(oppdatertBarnehagebarnFilter);
    };
    useEffect(() => {
        hentBarnehagebarnResponseRessurs();
    }, [barnehagebarnRequestParams]);

    return {
        barnehagebarnRequestParams,
        barnehagebarnResponse,
        data,
        updateOffset,
        updateLimit,
        updateSortByAscDesc,
        oppdaterFiltrering,
        barnehageKommuner,
    };
};
