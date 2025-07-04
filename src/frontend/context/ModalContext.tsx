import React, {
    createContext,
    type PropsWithChildren,
    useCallback,
    useContext,
    useReducer,
} from 'react';

interface ModalContext {
    hentTittel: (type: ModalType) => string;
    settTittel: (type: ModalType, tittel: string) => void;
    åpneModal: <T extends keyof Args>(type: T, args: Args[T]) => void;
    lukkModal: (type: ModalType) => void;
    erModalÅpen: (type: ModalType) => boolean;
    hentArgs: <T extends keyof Args>(type: T) => Args[T] | undefined;
    hentBredde: (type: ModalType) => `${number}${string}`;
    settBredde: (type: ModalType, bredde: `${number}${string}`) => void;
}

export enum ModalType {
    EXAMPLE_MODAL = 'EXAMPLE_MODAL',
    FEILMELDING = 'FEILMELDING',
}

export interface Args {
    [ModalType.EXAMPLE_MODAL]: { fagsak: string };
    [ModalType.FEILMELDING]: { feilmelding: string | React.ReactNode };
}

interface BaseState {
    tittel: string;
    åpen: boolean;
    bredde: `${number}${string}`;
}

interface State {
    [ModalType.EXAMPLE_MODAL]: BaseState & {
        args: Args[ModalType.EXAMPLE_MODAL] | undefined;
    };
    [ModalType.FEILMELDING]: BaseState & {
        args: Args[ModalType.FEILMELDING] | undefined;
    };
}

const initialState: { [key in ModalType]: State[key] } = {
    [ModalType.EXAMPLE_MODAL]: {
        tittel: 'Example modal',
        åpen: false,
        bredde: '80rem',
        args: undefined,
    },
    [ModalType.FEILMELDING]: {
        tittel: 'Det har oppstått en feil',
        åpen: false,
        bredde: '50rem',
        args: undefined,
    },
};

enum ActionType {
    SETT_TITTEL = 'SETT_TITTEL',
    ÅPNE_MODAL = 'ÅPNE_MODAL',
    LUKK_MODAL = 'LUKK_MODAL',
    SETT_BREDDE = 'SETT_BREDDE',
}

interface SettTittelAction {
    type: ActionType.SETT_TITTEL;
    payload: { type: ModalType; tittel: string };
}

interface ÅpneModalAction<T extends keyof Args> {
    type: ActionType.ÅPNE_MODAL;
    payload: { type: ModalType; args: Args[T] };
}

interface LukkModalAction {
    type: ActionType.LUKK_MODAL;
    payload: { type: ModalType };
}

interface SettBreddeAction {
    type: ActionType.SETT_BREDDE;
    payload: { type: ModalType; bredde: `${number}${string}` };
}

type Action<T extends keyof Args> =
    | ÅpneModalAction<T>
    | LukkModalAction
    | SettBreddeAction
    | SettTittelAction;

function reducer<T extends keyof Args>(state: State, action: Action<T>) {
    const { type, payload } = action;
    switch (type) {
        case ActionType.ÅPNE_MODAL:
            return {
                ...state,
                [payload.type]: {
                    ...state[payload.type],
                    åpen: true,
                    args: payload.args,
                },
            };
        case ActionType.LUKK_MODAL:
            return {
                ...state,
                [payload.type]: {
                    ...state[payload.type],
                    åpen: false,
                    args: undefined,
                    bredde: initialState[payload.type].bredde,
                    tittel: initialState[payload.type].tittel,
                },
            };
        case ActionType.SETT_BREDDE:
            return {
                ...state,
                [payload.type]: {
                    ...state[payload.type],
                    bredde: payload.bredde,
                },
            };
        case ActionType.SETT_TITTEL:
            return {
                ...state,
                [payload.type]: {
                    ...state[payload.type],
                    tittel: payload.tittel,
                },
            };
        default:
            return state;
    }
}

const ModalContext = createContext<ModalContext | undefined>(undefined);

export function ModalProvider({ children }: PropsWithChildren) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const hentTittel = useCallback(
        (type: ModalType) => {
            return state[type].tittel;
        },
        [state]
    );

    const settTittel = useCallback(
        (type: ModalType, tittel: string) => {
            dispatch({ type: ActionType.SETT_TITTEL, payload: { type, tittel } });
        },
        [dispatch]
    );

    const åpneModal = useCallback(
        <T extends keyof Args>(type: ModalType, args: Args[T]) => {
            dispatch({ type: ActionType.ÅPNE_MODAL, payload: { type, args } });
        },
        [dispatch]
    );

    const lukkModal = useCallback(
        (type: ModalType) => {
            dispatch({ type: ActionType.LUKK_MODAL, payload: { type } });
        },
        [dispatch]
    );

    const erModalÅpen = useCallback(
        (type: ModalType) => {
            return state[type].åpen;
        },
        [state]
    );

    const hentArgs = useCallback(
        <T extends keyof Args>(type: T) => {
            return state[type].args as Args[T];
        },
        [state]
    );

    const hentBredde = useCallback(
        (type: ModalType) => {
            return state[type].bredde;
        },
        [state]
    );

    const settBredde = useCallback(
        (type: ModalType, bredde: `${number}${string}`) => {
            dispatch({ type: ActionType.SETT_BREDDE, payload: { type, bredde } });
        },
        [dispatch]
    );

    return (
        <ModalContext.Provider
            value={{
                hentTittel,
                settTittel,
                åpneModal,
                lukkModal,
                erModalÅpen,
                hentArgs,
                hentBredde,
                settBredde,
            }}
        >
            {children}
        </ModalContext.Provider>
    );
}

export function useModalContext() {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModalContext må brukes innenfor en ModalProvider');
    }
    return context;
}
