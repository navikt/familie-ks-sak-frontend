import { createContext, type JSX, type PropsWithChildren, type ReactNode, useContext, useState } from 'react';

import type { IRestTilgang } from '@typer/person';
import { adressebeskyttelsestyper } from '@typer/person';
import type { AxiosRequestConfig } from 'axios';

import { Button, InlineMessage } from '@navikt/ds-react';
import { useHttp } from '@navikt/familie-http';
import type { Ressurs } from '@navikt/familie-typer';
import { RessursStatus } from '@navikt/familie-typer';

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
    lukkModal: () => void;
    appInfoModal: IModal;
    sjekkTilgang: (brukerIdent: string, visSystemetLaster?: boolean) => Promise<boolean>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const AppProvider = (props: PropsWithChildren) => {
    const { request } = useHttp();

    const [appInfoModal, settAppInfoModal] = useState<IModal>(initalState);

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
                            <InlineMessage status={'error'}>
                                {`Bruker har diskresjonskode ${
                                    adressebeskyttelsestyper[ressurs.data.adressebeskyttelsegradering]
                                }`}
                            </InlineMessage>
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

    return (
        <AppContext.Provider
            value={{
                lukkModal,
                appInfoModal,
                sjekkTilgang,
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
