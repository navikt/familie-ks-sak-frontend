import {
    type Dispatch,
    type JSX,
    type PropsWithChildren,
    type ReactNode,
    type SetStateAction,
    useContext,
} from 'react';
import { createContext, useState } from 'react';

import type { AxiosRequestConfig } from 'axios';

import { Alert, BodyShort, Button } from '@navikt/ds-react';
import { useHttp } from '@navikt/familie-http';
import type { Ressurs } from '@navikt/familie-typer';
import { RessursStatus } from '@navikt/familie-typer';

import { useAuthContext } from './AuthContext';
import { useFeatureToggles } from '../hooks/useFeatureToggles';
import { useSaksbehandler } from '../hooks/useSaksbehandler';
import type { IToast, ToastTyper } from '../komponenter/Toast/typer';
import { FeatureToggle } from '../typer/featureToggles';
import type { IRestTilgang } from '../typer/person';
import { adressebeskyttelsestyper } from '../typer/person';

export type FamilieAxiosRequestConfig<D> = AxiosRequestConfig & {
    data?: D;
    påvirkerSystemLaster?: boolean;
};

export interface IModal {
    actions?: JSX.Element[] | JSX.Element;
    innhold?: () => ReactNode;
    onClose?: () => void;
    tittel: string;
    visModal: boolean;
}

const initalState: IModal = {
    tittel: '',
    visModal: false,
};

interface AppContextValue {
    autentisert: boolean;
    lukkModal: () => void;
    appInfoModal: IModal;
    settToast: (toastId: ToastTyper, toast: IToast) => void;
    settToasts: Dispatch<
        SetStateAction<{
            [toastId: string]: IToast;
        }>
    >;
    sjekkTilgang: (brukerIdent: string, visSystemetLaster?: boolean) => Promise<boolean>;
    toasts: {
        [toastId: string]: IToast;
    };
    skalObfuskereData: boolean;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const AppProvider = (props: PropsWithChildren) => {
    const { autentisert } = useAuthContext();
    const { request } = useHttp();
    const toggles = useFeatureToggles();

    const [appInfoModal, settAppInfoModal] = useState<IModal>(initalState);
    const [toasts, settToasts] = useState<{ [toastId: string]: IToast }>({});

    const saksbehandler = useSaksbehandler();

    const lukkModal = () => {
        settAppInfoModal(initalState);
    };

    const sjekkTilgang = async (brukerIdent: string, visSystemetLaster = true): Promise<boolean> => {
        return request<{ brukerIdent: string }, IRestTilgang>({
            method: 'POST',
            url: '/familie-ks-sak/api/tilgang',
            data: { brukerIdent },
            påvirkerSystemLaster: visSystemetLaster,
        }).then((ressurs: Ressurs<IRestTilgang>) => {
            if (ressurs.status === RessursStatus.SUKSESS) {
                settAppInfoModal({
                    tittel: 'Diskresjonskode',
                    visModal: !ressurs.data.saksbehandlerHarTilgang,
                    onClose: () => lukkModal(),
                    innhold: () => {
                        return (
                            <Alert variant={'error'} inline>
                                <BodyShort>
                                    {`Bruker har diskresjonskode ${
                                        adressebeskyttelsestyper[ressurs.data.adressebeskyttelsegradering]
                                    }`}
                                </BodyShort>
                            </Alert>
                        );
                    },
                    actions: [
                        <Button
                            key={'lukk'}
                            variant={'primary'}
                            size={'small'}
                            onClick={lukkModal}
                            children={'Lukk'}
                        />,
                    ],
                });
                return ressurs.data.saksbehandlerHarTilgang;
            } else {
                return false;
            }
        });
    };

    const skalObfuskereData = toggles[FeatureToggle.skalObfuskereData] && !saksbehandler.harSkrivetilgang;

    return (
        <AppContext.Provider
            value={{
                autentisert,
                lukkModal,
                appInfoModal,
                settToast: (toastId: ToastTyper, toast: IToast) =>
                    settToasts({
                        ...toasts,
                        [toastId]: toast,
                    }),
                settToasts,
                sjekkTilgang,
                toasts,
                skalObfuskereData,
            }}
        >
            {props.children}
        </AppContext.Provider>
    );
};

const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext må brukes innenfor AppProvider');
    }
    return context;
};

export { AppProvider, useAppContext };
