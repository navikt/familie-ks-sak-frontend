import { queryKeys } from '@hooks/keys/queryKeys';
import { useFagsak } from '@hooks/useFagsak';
import { useNavigerAutomatiskTilSideForBehandlingssteg } from '@hooks/useNavigerAutomatiskTilSideForBehandlingssteg';
import { useQueryClient } from '@tanstack/react-query';
import type { IBehandling } from '@typer/behandling';
import { createContext, type PropsWithChildren, useContext } from 'react';

interface Props extends PropsWithChildren {
    behandling: IBehandling;
    settBehandling?: (behandling: IBehandling) => void;
}

interface BehandlingContextValue {
    behandling: IBehandling;
    settÅpenBehandling: (behandling: IBehandling, oppdaterMinimalFagsak?: boolean) => void;
}

const BehandlingContext = createContext<BehandlingContextValue | undefined>(undefined);

export function BehandlingProvider({ behandling, settBehandling = () => {}, children }: Props) {
    const fagsak = useFagsak();
    const queryClient = useQueryClient();

    useNavigerAutomatiskTilSideForBehandlingssteg({ behandling });

    const settÅpenBehandling = (behandling: IBehandling, oppdaterMinimalFagsak: boolean = true) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.historikkinnslag(behandling.behandlingId) });
        queryClient.invalidateQueries({
            queryKey: queryKeys.personerMedUgyldigEtterbetalingsperiode(behandling.behandlingId),
        });
        if (oppdaterMinimalFagsak) {
            queryClient.invalidateQueries({ queryKey: queryKeys.fagsak(fagsak.id) });
        }
        settBehandling(behandling);
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
