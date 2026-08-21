import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import type { ISimuleringDTO } from '@typer/simulering';

interface Props extends PropsWithChildren {
    simulering: ISimuleringDTO;
    harÅpenTilbakekreving: boolean;
    harÅpenTilbakekrevingError: Error | null;
}

interface SimuleringContextValue {
    simulering: ISimuleringDTO;
    harÅpenTilbakekreving: boolean;
    harÅpenTilbakekrevingError: Error | null;
    erFeilutbetaling: boolean;
}

const SimuleringContext = createContext<SimuleringContextValue | undefined>(undefined);

export function SimuleringProvider({ simulering, harÅpenTilbakekreving, harÅpenTilbakekrevingError, children }: Props) {
    const value = useMemo(
        () => ({
            simulering,
            harÅpenTilbakekreving,
            harÅpenTilbakekrevingError,
            erFeilutbetaling: simulering.feilutbetaling > 0,
        }),
        [simulering, harÅpenTilbakekreving, harÅpenTilbakekrevingError]
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
