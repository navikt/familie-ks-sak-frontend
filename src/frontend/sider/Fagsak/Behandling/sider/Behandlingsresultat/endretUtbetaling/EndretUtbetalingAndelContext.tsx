import type { IRestEndretUtbetalingAndel } from '@typer/utbetalingAndel';
import { createContext, type PropsWithChildren, useContext } from 'react';

interface Props extends PropsWithChildren {
    endretUtbetalingAndel: IRestEndretUtbetalingAndel;
}

interface EndretUtbetalingAndelContextValue {
    endretUtbetalingAndel: IRestEndretUtbetalingAndel;
}

const EndretUtbetalingAndelContext = createContext<EndretUtbetalingAndelContextValue | undefined>(undefined);

export function EndretUtbetalingAndelProvider({ endretUtbetalingAndel, children }: Props) {
    return (
        <EndretUtbetalingAndelContext.Provider value={{ endretUtbetalingAndel }}>
            {children}
        </EndretUtbetalingAndelContext.Provider>
    );
}

export function useEndretUtbetalingAndelContext() {
    const context = useContext(EndretUtbetalingAndelContext);
    if (context === undefined) {
        throw new Error('useEndretUtbetalingAndelContext må brukes innenfor en EndretUtbetalingAndelProvider.');
    }
    return context;
}
