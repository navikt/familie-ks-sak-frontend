import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useNavigate } from 'react-router';

import { useHttp } from '@navikt/familie-http';
import { byggFeiletRessurs, byggTomRessurs, type Ressurs, RessursStatus } from '@navikt/familie-typer';

import { useAppContext } from '../../../../context/AppContext';
import { useBehandlingIdParam } from '../../../../hooks/useBehandlingIdParam';
import { useFagsak } from '../../../../hooks/useFagsak';
import { HentFagsakQueryKeyFactory } from '../../../../hooks/useHentFagsak';
import { HentHistorikkinnslagQueryKeyFactory } from '../../../../hooks/useHentHistorikkinnslag';
import type { IBehandling } from '../../../../typer/behandling';
import { obfuskerBehandling } from '../../../../utils/obfuskerData';

interface Context {
    behandlingRessurs: Ressurs<IBehandling>;
    settBehandlingRessurs: (behandling: Ressurs<IBehandling>) => void;
}

const Context = createContext<Context | undefined>(undefined);

export function HentOgSettBehandlingProvider({ children }: PropsWithChildren) {
    const { skalObfuskereData } = useAppContext();
    const { request } = useHttp();

    const fagsak = useFagsak();
    const behandlingIdParam = useBehandlingIdParam();

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [behandlingRessurs, privatSettBehandlingRessurs] = useState<Ressurs<IBehandling>>(byggTomRessurs());

    const erBehandlingDelAvFagsak = fagsak.behandlinger.some(
        behandling => behandling.behandlingId === behandlingIdParam
    );

    useEffect(() => {
        if (behandlingIdParam !== undefined && !erBehandlingDelAvFagsak) {
            navigate(`/fagsak/${fagsak.id}`);
        }
    }, [behandlingIdParam, erBehandlingDelAvFagsak]);

    const settBehandlingRessurs = async (behandling: Ressurs<IBehandling>, oppdaterMinimalFagsak: boolean = true) => {
        if (behandling.status === RessursStatus.SUKSESS) {
            queryClient.invalidateQueries({
                queryKey: HentHistorikkinnslagQueryKeyFactory.historikkinnslag(behandling.data.behandlingId),
            });
        }
        if (oppdaterMinimalFagsak) {
            await queryClient.invalidateQueries({ queryKey: HentFagsakQueryKeyFactory.fagsak(fagsak.id) });
        }
        if (skalObfuskereData) {
            obfuskerBehandling(behandling);
        }
        privatSettBehandlingRessurs(behandling);
    };

    useEffect(() => {
        privatSettBehandlingRessurs(byggTomRessurs());
        if (behandlingIdParam) {
            request<void, IBehandling>({
                method: 'GET',
                url: `/familie-ks-sak/api/behandlinger/${behandlingIdParam}`,
                påvirkerSystemLaster: true,
            })
                .then(response => settBehandlingRessurs(response))
                .catch((_error: AxiosError) =>
                    privatSettBehandlingRessurs(byggFeiletRessurs('Ukjent ved innhenting av behandling'))
                );
        }
    }, [behandlingIdParam]);

    return <Context.Provider value={{ behandlingRessurs, settBehandlingRessurs }}>{children}</Context.Provider>;
}

export function useHentOgSettBehandlingContext() {
    const context = useContext(Context);
    if (context === undefined) {
        throw new Error('useHentOgSettBehandlingContext må brukes innenfor HentOgSettBehandlingProvider');
    }
    return context;
}
