import type { ISimuleringDTO, ITilbakekreving } from '@typer/simulering';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

interface Props extends PropsWithChildren {
    simulering: ISimuleringDTO;
    tilbakekreving: ITilbakekreving | undefined;
    harÅpenTilbakekreving: boolean;
}

interface SimuleringContextValue {
    simulering: ISimuleringDTO;
    tilbakekreving: ITilbakekreving | undefined;
    harÅpenTilbakekreving: boolean;
    erFeilutbetaling: boolean;
}

const SimuleringContext = createContext<SimuleringContextValue | undefined>(undefined);

export function SimuleringProvider({ simulering, tilbakekreving, harÅpenTilbakekreving, children }: Props) {
    const value = useMemo(
        () => ({
            simulering,
            tilbakekreving,
            harÅpenTilbakekreving,
            erFeilutbetaling: simulering.feilutbetaling > 0,
        }),
        [simulering, tilbakekreving, harÅpenTilbakekreving]
    );

    return <SimuleringContext.Provider value={value}>{children}</SimuleringContext.Provider>;
}

export function useSimuleringContext() {
    const context = useContext(SimuleringContext);

    if (context === undefined) {
        throw new Error('useSimuleringContext må brukes innenfor en SimuleringProvider');
    }

    return context;
}
