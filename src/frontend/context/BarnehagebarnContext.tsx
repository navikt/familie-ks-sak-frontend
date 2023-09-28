import React, { useEffect, useMemo, useState } from 'react';

import type { AxiosError } from 'axios';
import createUseContext from 'constate';

import { useHttp } from '@navikt/familie-http';
import type { Ressurs } from '@navikt/familie-typer';
import {
    byggFeiletRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    RessursStatus,
} from '@navikt/familie-typer';

import Barnehagebarn from '../komponenter/Barnehagebarn/Barnehagebarn';
import type { IBarnehagebarnRequestParams, IBarnehagebarnResponse } from '../typer/barnehagebarn';
import type { IBarnehagebarn } from '../typer/barnehagebarn';

const localStorageOn = false;
const localStorageKey = 'barnehagebarnRequestParams';

const defaultBarnehagebarnRequestParams: IBarnehagebarnRequestParams = {
    ident: '',
    kommuneNavn: '',
    kunLøpendeFagsak: false,
    limit: 20,
    offset: 0,
    sortBy: 'kommuneNavn',
    sortAsc: false,
};

const [BarnehagebarnProvider, useBarnehagebarn] = createUseContext(() => {
    const { request } = useHttp();

    const [barnehagebarnRequestParams, settBarnehagebarnRequestParams] =
        useState<IBarnehagebarnRequestParams>({ ...defaultBarnehagebarnRequestParams });

    const [barnehagebarnResponse, settBarnehagebarnResponse] = useState<
        Ressurs<IBarnehagebarnResponse>
    >(byggTomRessurs<IBarnehagebarnResponse>());

    const [resetForm, setResetForm] = useState<boolean>(false);

    const data: ReadonlyArray<IBarnehagebarn> = useMemo(() => {
        return barnehagebarnResponse.status === RessursStatus.SUKSESS &&
            barnehagebarnResponse.data.content.length > 0
            ? barnehagebarnResponse.data.content
            : [];
    }, [barnehagebarnResponse]);

    const hentBarnehagebarnResponseRessurs = () => {
        settBarnehagebarnResponse(byggHenterRessurs());
        hentBarnehagebarnResponseRessursFraBackend().then(
            (barnehagebarnDtoRessurs: Ressurs<IBarnehagebarnResponse>) => {
                settBarnehagebarnResponse(barnehagebarnDtoRessurs);
                setResetForm(false);
            }
        );
    };

    const hentBarnehagebarnResponseRessursFraBackend = (): Promise<
        Ressurs<IBarnehagebarnResponse>
    > => {
        return request<IBarnehagebarnRequestParams, IBarnehagebarnResponse>({
            data: barnehagebarnRequestParams,
            method: 'POST',
            url: `/familie-ks-sak/api/barnehagebarn/barnehagebarnliste`,
        })
            .then((barnehagebarnResponseRessurs: Ressurs<IBarnehagebarnResponse>) => {
                return barnehagebarnResponseRessurs;
            })
            .catch((_error: AxiosError) => {
                return byggFeiletRessurs('Ukjent feil ved innhenting av barnehagebarn');
            });
    };

    /* Pagination values */
    const updateOffset = (offset: number) => {
        if (offset !== barnehagebarnRequestParams.offset) {
            const newBarnehageRequestParams = { ...barnehagebarnRequestParams, offset: offset };
            settBarnehagebarnRequestParams(newBarnehageRequestParams);
            // addToLocalStorageIfEnabled(newBarnehageRequestParams);
        }
    };
    const updateLimit = (limit: number) => {
        const newBarnehageRequestParams = {
            ...barnehagebarnRequestParams,
            limit: limit,
            offset: 0,
        };
        settBarnehagebarnRequestParams(newBarnehageRequestParams);
        // addToLocalStorageIfEnabled(newBarnehageRequestParams);
    };

    /* Sorting values */
    const updateSortByAscDesc = (fieldName: string) => {
        let sortAscDesc = barnehagebarnRequestParams.sortAsc;
        if (fieldName === barnehagebarnRequestParams.sortBy) {
            sortAscDesc = !sortAscDesc;
        }
        const newBarnehageRequestParams = {
            ...barnehagebarnRequestParams,
            sortBy: fieldName,
            sortAsc: sortAscDesc,
        };
        settBarnehagebarnRequestParams(newBarnehageRequestParams);
        // addToLocalStorageIfEnabled(newBarnehageRequestParams);
    };

    // Filter values
    const updateIdent = (value: string) => {
        const newBarnehageRequestParams = {
            ...barnehagebarnRequestParams,
            ident: value,
            kommuneNavn: '',
        };
        settBarnehagebarnRequestParams(newBarnehageRequestParams);
    };

    const updateKommuneNavn = (value: string) => {
        const newBarnehageRequestParams = {
            ...barnehagebarnRequestParams,
            kommuneNavn: value,
            ident: '',
        };
        settBarnehagebarnRequestParams(newBarnehageRequestParams);
    };

    const updateKunLøpendeFagsak = () => {
        const value = !barnehagebarnRequestParams.kunLøpendeFagsak;
        const newBarnehageRequestParams = {
            ...barnehagebarnRequestParams,
            kunLøpendeFagsak: value,
        };
        settBarnehagebarnRequestParams(newBarnehageRequestParams);
    };

    const fjernBarnehagebarnFiltere = () => {
        setResetForm(true);
        const newBarnehageRequestParams = {
            ...barnehagebarnRequestParams,
            ident: '',
            kommuneNavn: '',
            kunLøpendeFagsak: false,
        };
        settBarnehagebarnRequestParams(newBarnehageRequestParams);
    };

    useEffect(() => {
        if (
            barnehagebarnRequestParams.ident === '' &&
            barnehagebarnRequestParams.kommuneNavn === '' &&
            !barnehagebarnRequestParams.kunLøpendeFagsak &&
            resetForm
        ) {
            hentBarnehagebarnResponseRessurs();
        }
    }, [barnehagebarnRequestParams.ident, barnehagebarnRequestParams.kommuneNavn, resetForm]);

    useEffect(() => {
        hentBarnehagebarnResponseRessurs();
    }, [
        barnehagebarnRequestParams.offset,
        barnehagebarnRequestParams.limit,
        barnehagebarnRequestParams.sortBy,
        barnehagebarnRequestParams.sortAsc,
    ]);

    useEffect(() => {
        if (localStorageOn) {
            const data = localStorage.getItem(localStorageKey);
            if (data) settBarnehagebarnRequestParams(JSON.parse(data));
        }
    }, []);

    useEffect(() => {
        if (localStorageOn) {
            const newBarnehageRequestParams = { ...barnehagebarnRequestParams, offset: 0 };
            localStorage.setItem(localStorageKey, JSON.stringify(newBarnehageRequestParams));
        }
    }, [barnehagebarnRequestParams]);

    return {
        barnehagebarnRequestParams,
        hentBarnehagebarnResponseRessurs,
        barnehagebarnResponse,
        data,
        updateOffset,
        updateLimit,
        updateSortByAscDesc,
        updateIdent,
        updateKommuneNavn,
        updateKunLøpendeFagsak,
        fjernBarnehagebarnFiltere,
    };
});

const BarnehagebarnComp: React.FC = () => {
    return (
        <BarnehagebarnProvider>
            <Barnehagebarn />
        </BarnehagebarnProvider>
    );
};

export { BarnehagebarnComp, useBarnehagebarn };
