import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useNavigate } from 'react-router';

import { useHttp } from '@navikt/familie-http';
import { byggFeiletRessurs, byggTomRessurs, type Ressurs, RessursStatus } from '@navikt/familie-typer';

import { useAppContext } from '../../../../context/AppContext';
import { HentFagsakQueryKeyFactory } from '../../../../hooks/useHentFagsak';
import { HentHistorikkinnslagQueryKeyFactory } from '../../../../hooks/useHentHistorikkinnslag';
import useSakOgBehandlingParams from '../../../../hooks/useSakOgBehandlingParams';
import type { IBehandling } from '../../../../typer/behandling';
import { obfuskerBehandling } from '../../../../utils/obfuskerData';
import { useFagsakContext } from '../../FagsakContext';

interface Context {
    behandlingRessurs: Ressurs<IBehandling>;
    settBehandlingRessurs: (behandling: Ressurs<IBehandling>) => void;
}

const Context = createContext<Context | undefined>(undefined);

export function HentOgSettBehandlingProvider({ children }: PropsWithChildren) {
    const { fagsak } = useFagsakContext();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { request } = useHttp();
    const { behandlingId } = useSakOgBehandlingParams();
    const { skalObfuskereData } = useAppContext();

    const [behandlingRessurs, privatSettBehandlingRessurs] = useState<Ressurs<IBehandling>>(byggTomRessurs());

    const erBehandlingDelAvFagsak = fagsak.behandlinger.some(
        behandling => behandling.behandlingId.toString() === behandlingId
    );

    useEffect(() => {
        if (behandlingId !== undefined && !erBehandlingDelAvFagsak) {
            navigate(`/fagsak/${fagsak.id}`);
        }
    }, [behandlingId, erBehandlingDelAvFagsak]);

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
        if (behandlingId) {
            request<void, IBehandling>({
                method: 'GET',
                url: `/familie-ks-sak/api/behandlinger/${behandlingId}`,
                påvirkerSystemLaster: true,
            })
                .then(response => settBehandlingRessurs(response))
                .catch((_error: AxiosError) =>
                    privatSettBehandlingRessurs(byggFeiletRessurs('Ukjent ved innhenting av behandling'))
                );
        }
    }, [behandlingId]);

    return <Context.Provider value={{ behandlingRessurs, settBehandlingRessurs }}>{children}</Context.Provider>;
}

export function useHentOgSettBehandlingContext() {
    const context = useContext(Context);
    if (context === undefined) {
        throw new Error('useHentOgSettBehandlingContext må brukes innenfor HentOgSettBehandlingProvider');
    }
    return context;
}
