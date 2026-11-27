import { useNavigerAutomatiskTilSideForBehandlingssteg } from '@hooks/useNavigerAutomatiskTilSideForBehandlingssteg';
import type { IBehandling } from '@typer/behandling';
import { createContext, type PropsWithChildren, useContext } from 'react';

interface Props extends PropsWithChildren {
    behandling: IBehandling;
    settBehandling?: (behandling: IBehandling) => void;
}

interface BehandlingContextValue {
    behandling: IBehandling;
    settÅpenBehandling: (behandling: IBehandling) => void;
}

const BehandlingContext = createContext<BehandlingContextValue | undefined>(undefined);

export function BehandlingProvider({ behandling, settBehandling = () => {}, children }: Props) {
    useNavigerAutomatiskTilSideForBehandlingssteg({ behandling });

    return (
        <BehandlingContext.Provider value={{ behandling, settÅpenBehandling: settBehandling }}>
            {children}
        </BehandlingContext.Provider>
    );
}

export function useBehandlingContext() {
    const context = useContext(BehandlingContext);
    if (context === undefined) {
        throw new Error('useBehandlingContext må brukes innenfor en BehandlingProvider.');
    }
    return context;
}
