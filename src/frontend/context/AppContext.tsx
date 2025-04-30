import type { JSX, PropsWithChildren, ReactNode } from 'react';
import React, { createContext, useEffect, useState } from 'react';

import type { AxiosRequestConfig } from 'axios';

import { Alert, BodyShort, Button } from '@navikt/ds-react';
import { loggFeil, useHttp } from '@navikt/familie-http';
import type { ISaksbehandler, Ressurs } from '@navikt/familie-typer';
import { RessursStatus } from '@navikt/familie-typer';

import { useAuthContext } from './AuthContext';
import type { IToast, ToastTyper } from '../komponenter/Toast/typer';
import { BehandlerRolle } from '../typer/behandling';
import type { IRestTilgang } from '../typer/person';
import { adressebeskyttelsestyper } from '../typer/person';
import type { IToggles } from '../typer/toggles';
import { alleTogglerAv, ToggleNavn } from '../typer/toggles';
import { gruppeIdTilRolle, gruppeIdTilSuperbrukerRolle } from '../utils/behandling';
import { tilFeilside } from '../utils/commons';

const FEM_MINUTTER = 300000;

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
    hentSaksbehandlerRolle: () => BehandlerRolle;
    innloggetSaksbehandler: ISaksbehandler | undefined;
    harInnloggetSaksbehandlerSkrivetilgang: () => boolean;
    harInnloggetSaksbehandlerSuperbrukerTilgang: () => boolean | undefined;
    lukkModal: () => void;
    appInfoModal: IModal;
    settToast: (toastId: ToastTyper, toast: IToast) => void;
    settToasts: React.Dispatch<
        React.SetStateAction<{
            [toastId: string]: IToast;
        }>
    >;
    sjekkTilgang: (brukerIdent: string, visSystemetLaster?: boolean) => Promise<boolean>;
    systemetLaster: () => boolean;
    toasts: {
        [toastId: string]: IToast;
    };
    toggles: IToggles;
    skalObfuskereData: () => boolean;
    erTogglesHentet: boolean;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const AppProvider = (props: PropsWithChildren) => {
    const { autentisert, innloggetSaksbehandler } = useAuthContext();
    const { request, systemetLaster } = useHttp();

    const [toggles, settToggles] = useState<IToggles>(alleTogglerAv());
    const [appVersjon, settAppVersjon] = useState('');

    const [appInfoModal, settAppInfoModal] = React.useState<IModal>(initalState);
    const [toasts, settToasts] = useState<{ [toastId: string]: IToast }>({});
    const [erTogglesHentet, settErTogglesHentet] = useState(false);

    const verifiserVersjon = () => {
        request<void, string>({
            url: '/version',
            method: 'GET',
        }).then((versjon: Ressurs<string>) => {
            if (versjon.status === RessursStatus.SUKSESS) {
                if (appVersjon !== '' && appVersjon !== versjon.data) {
                    settAppInfoModal({
                        tittel: 'Løsningen er utdatert',
                        innhold: () => {
                            return (
                                <div className={'utdatert-losning'}>
                                    <Alert variant={'info'} inline>
                                        <BodyShort>
                                            Det finnes en oppdatert versjon av løsningen. Det
                                            anbefales at du oppdaterer med en gang.
                                        </BodyShort>
                                    </Alert>
                                </div>
                            );
                        },
                        visModal: true,
                        onClose: () => lukkModal(),
                        actions: [
                            <Button
                                key={'oppdater'}
                                variant={'primary'}
                                size={'small'}
                                onClick={() => {
                                    window.location.reload();
                                }}
                                children={'Ok, oppdater'}
                            />,
                            <Button
                                key={'avbryt'}
                                size={'small'}
                                variant={'tertiary'}
                                onClick={() => lukkModal()}
                                children={'Avbryt'}
                            />,
                        ],
                    });
                }

                settAppVersjon(versjon.data);
            }
        });

        setTimeout(() => {
            verifiserVersjon();
        }, FEM_MINUTTER);
    };

    useEffect(() => verifiserVersjon(), []);

    useEffect(() => {
        request<string[], IToggles>({
            method: 'POST',
            url: '/familie-ks-sak/api/featuretoggles',
            data: Object.values(ToggleNavn),
        }).then((response: Ressurs<IToggles>) => {
            if (response.status === RessursStatus.SUKSESS) {
                settToggles(response.data);
            } else {
                settToggles(alleTogglerAv);
            }
            settErTogglesHentet(true);
        });
    }, []);

    const lukkModal = () => {
        settAppInfoModal(initalState);
    };

    const sjekkTilgang = async (
        brukerIdent: string,
        visSystemetLaster = true
    ): Promise<boolean> => {
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
                                        adressebeskyttelsestyper[
                                            ressurs.data.adressebeskyttelsegradering
                                        ]
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

    const hentSaksbehandlerRolle = (): BehandlerRolle => {
        let rolle = BehandlerRolle.UKJENT;
        if (innloggetSaksbehandler && innloggetSaksbehandler.groups) {
            innloggetSaksbehandler.groups.forEach((id: string) => {
                rolle = rolle < gruppeIdTilRolle(id) ? gruppeIdTilRolle(id) : rolle;
            });
        }

        if (innloggetSaksbehandler && rolle === BehandlerRolle.UKJENT) {
            loggFeil(
                undefined,
                innloggetSaksbehandler,
                'Saksbehandler tilhører ingen av de definerte tilgangsgruppene.'
            );
            tilFeilside();
        }

        return rolle;
    };

    const harInnloggetSaksbehandlerSuperbrukerTilgang = () =>
        innloggetSaksbehandler?.groups?.includes(gruppeIdTilSuperbrukerRolle);

    const harInnloggetSaksbehandlerSkrivetilgang = () => {
        const rolle = hentSaksbehandlerRolle();

        return rolle >= BehandlerRolle.SAKSBEHANDLER;
    };

    const skalObfuskereData = () =>
        toggles[ToggleNavn.skalObfuskereData] && !harInnloggetSaksbehandlerSkrivetilgang();

    return (
        <AppContext.Provider
            value={{
                autentisert,
                hentSaksbehandlerRolle,
                innloggetSaksbehandler,
                harInnloggetSaksbehandlerSkrivetilgang,
                harInnloggetSaksbehandlerSuperbrukerTilgang,
                lukkModal,
                appInfoModal,
                settToast: (toastId: ToastTyper, toast: IToast) =>
                    settToasts({
                        ...toasts,
                        [toastId]: toast,
                    }),
                settToasts,
                sjekkTilgang,
                systemetLaster,
                toasts,
                toggles,
                skalObfuskereData,
                erTogglesHentet,
            }}
        >
            {props.children}
        </AppContext.Provider>
    );
};

const useAppContext = () => {
    const context = React.useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext må brukes innenfor AppContentProvider');
    }
    return context;
};

export { AppProvider, useAppContext };
