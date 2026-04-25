import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';

import { useLocation } from 'react-router';

import { type Ressurs } from '@navikt/familie-typer';

import { useHentOgSettBehandlingContext } from './HentOgSettBehandlingContext';
import { saksbehandlerHarKunLesevisning } from './utils';
import { useAppContext } from '../../../../context/AppContext';
import { useNavigerAutomatiskTilSideForBehandlingssteg } from '../../../../hooks/useNavigerAutomatiskTilSideForBehandlingssteg';
import {
    BehandlerRolle,
    BehandlingStatus,
    BehandlingÅrsak,
    type IBehandling,
    type IBehandlingPåVent,
} from '../../../../typer/behandling';
import { harTilgangTilEnhet } from '../../../../typer/enhet';
import { PersonType } from '../../../../typer/person';
import { Målform } from '../../../../typer/søknad';
import { MIDLERTIDIG_BEHANDLENDE_ENHET_ID } from '../../../../utils/behandling';
import { hentSideHref } from '../../../../utils/miljø';
import { hentTrinnForBehandling, type ITrinn, KontrollertStatus, type SideId } from '../sider/sider';

interface Props extends PropsWithChildren {
    behandling: IBehandling;
}

interface BehandlingContextValue {
    vurderErLesevisning: (sjekkTilgangTilEnhet?: boolean, skalIgnorereOmEnhetErMidlertidig?: boolean) => boolean;
    leggTilBesøktSide: (besøktSide: SideId) => void;
    settIkkeKontrollerteSiderTilManglerKontroll: () => void;
    søkersMålform: Målform;
    trinnPåBehandling: { [sideId: string]: ITrinn };
    behandling: IBehandling;
    settÅpenBehandling: (behandling: Ressurs<IBehandling>, oppdaterMinimalFagsak?: boolean) => void;
    behandlingPåVent: IBehandlingPåVent | undefined;
}

const BehandlingContext = createContext<BehandlingContextValue | undefined>(undefined);

export const BehandlingProvider = ({ behandling, children }: Props) => {
    const { settBehandlingRessurs } = useHentOgSettBehandlingContext();

    useNavigerAutomatiskTilSideForBehandlingssteg({ behandling });

    const {
        harInnloggetSaksbehandlerSkrivetilgang,
        harInnloggetSaksbehandlerSuperbrukerTilgang,
        innloggetSaksbehandler,
        hentSaksbehandlerRolle,
    } = useAppContext();

    const location = useLocation();
    const [trinnPåBehandling, settTrinnPåBehandling] = useState<{ [sideId: string]: ITrinn }>({});

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

    const vurderErLesevisning = (sjekkTilgangTilEnhet = true, skalIgnorereOmEnhetErMidlertidig = false): boolean => {
        if (behandling.behandlingPåVent || behandling.status === BehandlingStatus.SATT_PÅ_MASKINELL_VENT) {
            return true;
        }
        if (erBehandleneEnhetMidlertidig && !skalIgnorereOmEnhetErMidlertidig) {
            return true;
        }

        const innloggetSaksbehandlerSkrivetilgang = harInnloggetSaksbehandlerSkrivetilgang();
        const innloggetSaksbehandlerHarSuperbrukerTilgang = harInnloggetSaksbehandlerSuperbrukerTilgang();

        const behandlingsårsak = behandling.årsak;
        const behandlingsårsakErÅpenForAlleMedTilgangTilÅOppretteÅrsak =
            behandlingsårsak === BehandlingÅrsak.KORREKSJON_VEDTAKSBREV;

        const saksbehandlerHarTilgangTilEnhet =
            innloggetSaksbehandlerHarSuperbrukerTilgang ||
            behandlingsårsakErÅpenForAlleMedTilgangTilÅOppretteÅrsak ||
            harTilgangTilEnhet(
                behandling.arbeidsfordelingPåBehandling.behandlendeEnhetId ?? '',
                innloggetSaksbehandler?.groups ?? []
            );

        const steg = behandling.steg;
        const status = behandling.status;

        return saksbehandlerHarKunLesevisning(
            innloggetSaksbehandlerSkrivetilgang,
            saksbehandlerHarTilgangTilEnhet,
            steg,
            status,
            sjekkTilgangTilEnhet
        );
    };

    const søkersMålform: Målform =
        behandling.personer.find(person => person.type === PersonType.SØKER)?.målform ?? Målform.NB;

    const kanBeslutteVedtak =
        behandling.status === BehandlingStatus.FATTER_VEDTAK &&
        BehandlerRolle.BESLUTTER === hentSaksbehandlerRolle() &&
        innloggetSaksbehandler?.email !== behandling.endretAv;

    const erBehandleneEnhetMidlertidig =
        behandling.arbeidsfordelingPåBehandling.behandlendeEnhetId === MIDLERTIDIG_BEHANDLENDE_ENHET_ID;

    return (
        <BehandlingContext.Provider
            value={{
                vurderErLesevisning,
                leggTilBesøktSide,
                settIkkeKontrollerteSiderTilManglerKontroll,
                søkersMålform,
                trinnPåBehandling,
                behandling,
                behandlingPåVent: behandling.behandlingPåVent,
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
