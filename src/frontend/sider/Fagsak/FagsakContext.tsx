import type { PropsWithChildren } from 'react';
import { createContext, useContext } from 'react';

import type { IMinimalFagsak } from '../../typer/fagsak';

interface Context {
    fagsak: IMinimalFagsak;
}

const Context = createContext<Context | undefined>(undefined);

interface Props extends PropsWithChildren {
    fagsak: IMinimalFagsak;
}

export function FagsakProvider({ fagsak, children }: Props) {
    return <Context.Provider value={{ fagsak }}>{children}</Context.Provider>;
}

export function useFagsakContext() {
    const context = useContext(Context);
    if (context === undefined) {
        throw new Error('useFagsakContext må brukes innenfor en FagsakProvider');
    }
    return context;
}
