import { useState } from 'react';

import type { AxiosError } from 'axios';

import { useHttp } from '@navikt/familie-http';
import {
    byggFeiletRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    type Ressurs,
    RessursStatus,
} from '@navikt/familie-typer';

import type { BarnehagebarnFilter, BarnehagebarnRequestParams, Barnehagekommune } from '../../typer/barnehagebarn';

const defaultBarnehagebarnRequestParams: BarnehagebarnRequestParams = {
    ident: '',
    kommuneNavn: '',
    kunLøpendeAndel: false,
    limit: 20,
    offset: 0,
    sortBy: 'kommuneNavn',
    sortAsc: false,
};

export interface BarnehagebarnContext {
    barnehagebarnRequestParams: BarnehagebarnRequestParams;
    updateOffset: (offset: number) => void;
    updateLimit: (limit: number) => void;
    updateSortByAscDesc: (fieldName: string) => void;
    oppdaterFiltrering: (filter: BarnehagebarnFilter) => void;
    barnehageKommuner: () => Barnehagekommune[];
}

const BARNEHAGEKOMMUNER_URL = '/familie-ks-sak/api/barnehagebarn/barnehagekommuner';

export const useBarnehagelister = (): BarnehagebarnContext => {
    const { request } = useHttp();

    const [barnehagebarnRequestParams, settBarnehagebarnRequestParams] = useState<BarnehagebarnRequestParams>({
        ...defaultBarnehagebarnRequestParams,
    });

    const [barnehagekommunerRessurs, settBarnehagekommunerRessurs] =
        useState<Ressurs<Barnehagekommune[]>>(byggTomRessurs<Barnehagekommune[]>());

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
                settBarnehagekommunerRessurs(byggFeiletRessurs('Ukjent feil ved innhenting av barnehagekommuner'));
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

    return {
        barnehagebarnRequestParams,
        updateOffset,
        updateLimit,
        updateSortByAscDesc,
        oppdaterFiltrering,
        barnehageKommuner,
    };
};
