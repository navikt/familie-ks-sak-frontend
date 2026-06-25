import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';

import { useNavigerAutomatiskTilSideForBehandlingssteg } from '@hooks/useNavigerAutomatiskTilSideForBehandlingssteg';
import { useSaksbehandler } from '@hooks/useSaksbehandler';
import { BehandlerRolle, BehandlingStatus, type IBehandling } from '@typer/behandling';
import { hentSideHref } from '@utils/miljø';
import { useLocation } from 'react-router';

import { type Ressurs } from '@navikt/familie-typer';

import { useHentOgSettBehandlingContext } from './HentOgSettBehandlingContext';
import { hentTrinnForBehandling, type Trinn, KontrollertStatus, type SideId } from '../sider/sider';

interface Props extends PropsWithChildren {
    behandling: IBehandling;
}

interface BehandlingContextValue {
    leggTilBesøktSide: (besøktSide: SideId) => void;
    settIkkeKontrollerteSiderTilManglerKontroll: () => void;
    trinnPåBehandling: { [sideId: string]: Trinn };
    behandling: IBehandling;
    settÅpenBehandling: (behandling: Ressurs<IBehandling>, oppdaterMinimalFagsak?: boolean) => void;
}

const BehandlingContext = createContext<BehandlingContextValue | undefined>(undefined);

export const BehandlingProvider = ({ behandling, children }: Props) => {
    const { settBehandlingRessurs } = useHentOgSettBehandlingContext();

    const saksbehandler = useSaksbehandler();

    useNavigerAutomatiskTilSideForBehandlingssteg({ behandling });

    const location = useLocation();
    const [trinnPåBehandling, settTrinnPåBehandling] = useState<{ [sideId: string]: Trinn }>({});

    useEffect(() => {
        const siderPåBehandling = hentTrinnForBehandling(behandling);

        const sideHref = hentSideHref(location.pathname);
        settTrinnPåBehandling(
            Object.entries(siderPåBehandling).reduce((acc, [sideId, side]) => {
                return {
                    ...acc,
                    [sideId]: {
                        ...side,
                        kontrollert:
                            sideHref === side.href ? KontrollertStatus.KONTROLLERT : KontrollertStatus.IKKE_KONTROLLERT,
                    },
                };
            }, {})
        );
    }, [behandling]);

    const leggTilBesøktSide = (besøktSide: SideId) => {
        if (kanBeslutteVedtak) {
            settTrinnPåBehandling({
                ...trinnPåBehandling,
                [besøktSide]: {
                    ...trinnPåBehandling[besøktSide],
                    kontrollert: KontrollertStatus.KONTROLLERT,
                },
            });
        }
    };

    const settIkkeKontrollerteSiderTilManglerKontroll = () => {
        settTrinnPåBehandling(
            Object.entries(trinnPåBehandling).reduce((acc, [sideId, trinn]) => {
                if (trinn.kontrollert === KontrollertStatus.IKKE_KONTROLLERT) {
                    return {
                        ...acc,
                        [sideId]: {
                            ...trinn,
                            kontrollert: KontrollertStatus.MANGLER_KONTROLL,
                        },
                    };
                } else return acc;
            }, trinnPåBehandling)
        );
    };

    const kanBeslutteVedtak =
        behandling.status === BehandlingStatus.FATTER_VEDTAK &&
        BehandlerRolle.BESLUTTER === saksbehandler.rolle &&
        saksbehandler.email !== behandling.endretAv;

    return (
        <BehandlingContext.Provider
            value={{
                leggTilBesøktSide,
                settIkkeKontrollerteSiderTilManglerKontroll,
                trinnPåBehandling,
                behandling,
                settÅpenBehandling: settBehandlingRessurs,
            }}
        >
            {children}
        </BehandlingContext.Provider>
    );
};

export const useBehandlingContext = () => {
    const context = useContext(BehandlingContext);

    if (context === undefined) {
        throw new Error('useBehandlingContext må brukes innenfor en BehandlingProvider');
    }

    return context;
};
