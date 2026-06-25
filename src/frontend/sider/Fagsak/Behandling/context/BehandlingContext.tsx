import { createContext, type PropsWithChildren, useContext } from 'react';

import { useNavigerAutomatiskTilSideForBehandlingssteg } from '@hooks/useNavigerAutomatiskTilSideForBehandlingssteg';
import { type IBehandling } from '@typer/behandling';

import { type Ressurs } from '@navikt/familie-typer';

import { useHentOgSettBehandlingContext } from './HentOgSettBehandlingContext';

interface Props extends PropsWithChildren {
    behandling: IBehandling;
}

interface BehandlingContextValue {
    behandling: IBehandling;
    settÅpenBehandling: (behandling: Ressurs<IBehandling>, oppdaterMinimalFagsak?: boolean) => void;
}

const BehandlingContext = createContext<BehandlingContextValue | undefined>(undefined);

export function BehandlingProvider({ behandling, children }: Props) {
    const { settBehandlingRessurs } = useHentOgSettBehandlingContext();

    useNavigerAutomatiskTilSideForBehandlingssteg({ behandling });

    return (
        <BehandlingContext.Provider value={{ behandling, settÅpenBehandling: settBehandlingRessurs }}>
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
