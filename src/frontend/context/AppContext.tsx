import type { JSX, PropsWithChildren, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';

import type { AxiosRequestConfig } from 'axios';
import createUseContext from 'constate';

import { Alert, BodyShort, Button } from '@navikt/ds-react';
import { HttpProvider, loggFeil, useHttp } from '@navikt/familie-http';
import type { ISaksbehandler, Ressurs } from '@navikt/familie-typer';
import { RessursStatus } from '@navikt/familie-typer';

import type { IToast, ToastTyper } from '../komponenter/Felleskomponenter/Toast/typer';
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

interface IProps extends PropsWithChildren {
    autentisertSaksbehandler: ISaksbehandler | undefined;
}

interface AuthProviderExports {
    autentisert: boolean;
    settAutentisert: (autentisert: boolean) => void;
    innloggetSaksbehandler: ISaksbehandler | undefined;
}

const [AuthProvider, useAuth] = createUseContext(
    ({ autentisertSaksbehandler }: IProps): AuthProviderExports => {
        const [autentisert, settAutentisert] = React.useState(true);
        const [innloggetSaksbehandler, settInnloggetSaksbehandler] =
            React.useState(autentisertSaksbehandler);

        useEffect(() => {
            if (autentisertSaksbehandler) {
                settInnloggetSaksbehandler(autentisertSaksbehandler);
            }
        }, [autentisertSaksbehandler]);

        return { autentisert, settAutentisert, innloggetSaksbehandler };
    }
);

const [AppContentProvider, useApp] = createUseContext(() => {
    const { autentisert, innloggetSaksbehandler } = useAuth();
    const { request, systemetLaster } = useHttp();

    const [toggles, settToggles] = useState<IToggles>(alleTogglerAv());
    const [appVersjon, settAppVersjon] = useState('');

    const [appInfoModal, settAppInfoModal] = React.useState<IModal>(initalState);
    const [toasts, settToasts] = useState<{ [toastId: string]: IToast }>({});

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

    return {
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
    };
});

const AuthOgHttpProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const { innloggetSaksbehandler, settAutentisert } = useAuth();

    return (
        <HttpProvider
            innloggetSaksbehandler={innloggetSaksbehandler}
            settAutentisert={settAutentisert}
        >
            <AppContentProvider>{children}</AppContentProvider>
        </HttpProvider>
    );
};

const AppProvider: React.FC<IProps> = ({ autentisertSaksbehandler, children }) => {
    return (
        <AuthProvider autentisertSaksbehandler={autentisertSaksbehandler}>
            <AuthOgHttpProvider children={children} />
        </AuthProvider>
    );
};

export { AppProvider, useApp };
