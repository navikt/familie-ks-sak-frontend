import { useFagsak } from '@hooks/useFagsak';
import { HentFagsakQueryKeyFactory } from '@hooks/useHentFagsak';
import { HentHistorikkinnslagQueryKeyFactory } from '@hooks/useHentHistorikkinnslag';
import { HentPersonerMedUgyldigEtterbetalingsperiodeQueryKeyFactory } from '@hooks/useHentPersonerMedUgyldigEtterbetalingsperiode';
import { useNavigerAutomatiskTilSideForBehandlingssteg } from '@hooks/useNavigerAutomatiskTilSideForBehandlingssteg';
import { useSkalObfuskereData } from '@hooks/useSkalObfuskereData';
import { type Ressurs, RessursStatus } from '@navikt/familie-typer';
import { useQueryClient } from '@tanstack/react-query';
import type { IBehandling } from '@typer/behandling';
import { obfuskerBehandling } from '@utils/obfuskerData';
import { createContext, type PropsWithChildren, useContext } from 'react';

interface Props extends PropsWithChildren {
    behandling: IBehandling;
    settBehandlingRessurs?: (behandling: Ressurs<IBehandling>) => void;
}

interface BehandlingContextValue {
    behandling: IBehandling;
    settÅpenBehandling: (behandling: Ressurs<IBehandling>, oppdaterMinimalFagsak?: boolean) => void;
}

const BehandlingContext = createContext<BehandlingContextValue | undefined>(undefined);

export function BehandlingProvider({ behandling, settBehandlingRessurs = () => {}, children }: Props) {
    const fagsak = useFagsak();
    const skalObfuskereData = useSkalObfuskereData();
    const queryClient = useQueryClient();

    useNavigerAutomatiskTilSideForBehandlingssteg({ behandling });

    const settÅpenBehandling = (behandling: Ressurs<IBehandling>, oppdaterMinimalFagsak: boolean = true) => {
        if (behandling.status === RessursStatus.SUKSESS) {
            queryClient.invalidateQueries({
                queryKey: HentHistorikkinnslagQueryKeyFactory.historikkinnslag(behandling.data.behandlingId),
            });
            queryClient.invalidateQueries({
                queryKey:
                    HentPersonerMedUgyldigEtterbetalingsperiodeQueryKeyFactory.personerMedUgyldigEtterbetalingsperiode(
                        behandling.data.behandlingId
                    ),
            });
        }
        if (oppdaterMinimalFagsak) {
            queryClient.invalidateQueries({ queryKey: HentFagsakQueryKeyFactory.fagsak(fagsak.id) });
        }
        if (skalObfuskereData) {
            obfuskerBehandling(behandling);
        }
        settBehandlingRessurs(behandling);
    };

    return (
        <BehandlingContext.Provider value={{ behandling, settÅpenBehandling }}>{children}</BehandlingContext.Provider>
    );
}

export function useBehandlingContext() {
    const context = useContext(BehandlingContext);
    if (context === undefined) {
        throw new Error('useBehandlingContext må brukes innenfor en BehandlingProvider.');
    }
    return context;
}
