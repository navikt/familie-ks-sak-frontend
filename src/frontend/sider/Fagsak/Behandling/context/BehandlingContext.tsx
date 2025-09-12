import React, { createContext, useContext, useEffect, useState } from 'react';

import { useLocation, useNavigate } from 'react-router';

import { type Ressurs } from '@navikt/familie-typer';

import { useHentOgSettBehandlingContext } from './HentOgSettBehandlingContext';
import useBehandlingApi from './useBehandlingApi';
import useBehandlingssteg from './useBehandlingssteg';
import { saksbehandlerHarKunLesevisning } from './utils';
import { useAppContext } from '../../../../context/AppContext';
import useSakOgBehandlingParams from '../../../../hooks/useSakOgBehandlingParams';
import {
    BehandlerRolle,
    BehandlingStatus,
    type BehandlingSteg,
    BehandlingÅrsak,
    type IBehandling,
    type IBehandlingPåVent,
    type IOpprettBehandlingData,
} from '../../../../typer/behandling';
import { harTilgangTilEnhet } from '../../../../typer/enhet';
import type { ILogg } from '../../../../typer/logg';
import { PersonType } from '../../../../typer/person';
import { Målform } from '../../../../typer/søknad';
import { MIDLERTIDIG_BEHANDLENDE_ENHET_ID } from '../../../../utils/behandling';
import { hentSideHref } from '../../../../utils/miljø';
import {
    erViPåUdefinertFagsakSide,
    erViPåUlovligSteg,
    finnSideForBehandlingssteg,
    hentTrinnForBehandling,
    type ISide,
    type ITrinn,
    KontrollertStatus,
    type SideId,
    sider,
} from '../sider/sider';

interface Props extends React.PropsWithChildren {
    behandling: IBehandling;
}

interface BehandlingContextValue {
    vurderErLesevisning: (
        sjekkTilgangTilEnhet?: boolean,
        skalIgnorereOmEnhetErMidlertidig?: boolean
    ) => boolean;
    forrigeÅpneSide: ISide | undefined;
    hentStegPåÅpenBehandling: () => BehandlingSteg | undefined;
    leggTilBesøktSide: (besøktSide: SideId) => void;
    settIkkeKontrollerteSiderTilManglerKontroll: () => void;
    søkersMålform: Målform;
    trinnPåBehandling: { [sideId: string]: ITrinn };
    behandling: IBehandling;
    opprettBehandling: (data: IOpprettBehandlingData) => Promise<void | Ressurs<IBehandling>>;
    logg: Ressurs<ILogg[]>;
    hentLogg: () => void;
    behandlingsstegSubmitressurs: Ressurs<IBehandling>;
    vilkårsvurderingNesteOnClick: () => void;
    behandlingresultatNesteOnClick: () => void;
    settÅpenBehandling: (behandling: Ressurs<IBehandling>, oppdaterMinimalFagsak?: boolean) => void;
    oppdaterRegisteropplysninger: () => Promise<Ressurs<IBehandling>>;
    foreslåVedtakNesteOnClick: (
        settVisModal: (visModal: boolean) => void,
        erUlagretNyFeilutbetaltValuta: boolean,
        erUlagretNyRefusjonEøsPeriode: boolean,
        erSammensattKontrollsak: boolean
    ) => void;
    behandlingPåVent: IBehandlingPåVent | undefined;
    erBehandleneEnhetMidlertidig?: boolean;
    åpenHøyremeny: boolean;
    settÅpenHøyremeny: (åpenHøyremeny: boolean) => void;
    åpenVenstremeny: boolean;
    settÅpenVenstremeny: (åpenVenstremeny: boolean) => void;
    erBehandlingAvsluttet: boolean;
}

const BehandlingContext = createContext<BehandlingContextValue | undefined>(undefined);

export const BehandlingProvider = ({ behandling, children }: Props) => {
    const { fagsakId } = useSakOgBehandlingParams();
    const { settBehandlingRessurs } = useHentOgSettBehandlingContext();
    const [åpenHøyremeny, settÅpenHøyremeny] = useState(true);
    const [åpenVenstremeny, settÅpenVenstremeny] = useState(true);

    const {
        submitRessurs: behandlingsstegSubmitressurs,
        vilkårsvurderingNesteOnClick,
        behandlingresultatNesteOnClick,
        foreslåVedtakNesteOnClick,
    } = useBehandlingssteg(settBehandlingRessurs, behandling);

    const { opprettBehandling, logg, hentLogg, oppdaterRegisteropplysninger } =
        useBehandlingApi(settBehandlingRessurs);

    const {
        harInnloggetSaksbehandlerSkrivetilgang,
        harInnloggetSaksbehandlerSuperbrukerTilgang,
        innloggetSaksbehandler,
        hentSaksbehandlerRolle,
    } = useAppContext();

    const navigate = useNavigate();
    const location = useLocation();
    const [forrigeÅpneSide, settForrigeÅpneSide] = React.useState<ISide | undefined>(undefined);
    const [trinnPåBehandling, settTrinnPåBehandling] = React.useState<{
        [sideId: string]: ITrinn;
    }>({});

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
                            sideHref === side.href
                                ? KontrollertStatus.KONTROLLERT
                                : KontrollertStatus.IKKE_KONTROLLERT,
                    },
                };
            }, {})
        );

        automatiskNavigeringTilSideForSteg();
    }, [behandling]);

    useEffect(() => {
        settForrigeÅpneSide(
            Object.values(sider).find((side: ISide) => location.pathname.includes(side.href))
        );
    }, [location.pathname]);

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

    const hentStegPåÅpenBehandling = (): BehandlingSteg | undefined => {
        return behandling.steg;
    };

    const vurderErLesevisning = (
        sjekkTilgangTilEnhet = true,
        skalIgnorereOmEnhetErMidlertidig = false
    ): boolean => {
        if (
            behandling.behandlingPåVent ||
            behandling.status === BehandlingStatus.SATT_PÅ_MASKINELL_VENT
        ) {
            return true;
        }
        if (erBehandleneEnhetMidlertidig && !skalIgnorereOmEnhetErMidlertidig) {
            return true;
        }

        const innloggetSaksbehandlerSkrivetilgang = harInnloggetSaksbehandlerSkrivetilgang();
        const innloggetSaksbehandlerHarSuperbrukerTilgang =
            harInnloggetSaksbehandlerSuperbrukerTilgang();

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

    const automatiskNavigeringTilSideForSteg = () => {
        const sideForSteg: ISide | undefined = finnSideForBehandlingssteg(behandling);

        if (
            (erViPåUdefinertFagsakSide(location.pathname) ||
                erViPåUlovligSteg(location.pathname, sideForSteg)) &&
            sideForSteg
        ) {
            navigate(`/fagsak/${fagsakId}/${behandling.behandlingId}/${sideForSteg.href}`);
        }
    };

    const søkersMålform: Målform =
        behandling.personer.find(person => person.type === PersonType.SØKER)?.målform ?? Målform.NB;

    const kanBeslutteVedtak =
        behandling.status === BehandlingStatus.FATTER_VEDTAK &&
        BehandlerRolle.BESLUTTER === hentSaksbehandlerRolle() &&
        innloggetSaksbehandler?.email !== behandling.endretAv;

    const erBehandleneEnhetMidlertidig =
        behandling.arbeidsfordelingPåBehandling.behandlendeEnhetId ===
        MIDLERTIDIG_BEHANDLENDE_ENHET_ID;

    const erBehandlingAvsluttet = behandling.status === BehandlingStatus.AVSLUTTET;

    return (
        <BehandlingContext.Provider
            value={{
                vurderErLesevisning,
                forrigeÅpneSide,
                hentStegPåÅpenBehandling,
                leggTilBesøktSide,
                settIkkeKontrollerteSiderTilManglerKontroll,
                søkersMålform,
                trinnPåBehandling,
                behandling: behandling,
                opprettBehandling,
                logg,
                hentLogg,
                behandlingsstegSubmitressurs,
                vilkårsvurderingNesteOnClick,
                behandlingresultatNesteOnClick,
                oppdaterRegisteropplysninger,
                foreslåVedtakNesteOnClick,
                behandlingPåVent: behandling?.behandlingPåVent,
                erBehandleneEnhetMidlertidig,
                åpenHøyremeny,
                settÅpenHøyremeny,
                åpenVenstremeny,
                settÅpenVenstremeny,
                erBehandlingAvsluttet,
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
