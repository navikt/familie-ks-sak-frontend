import React, { createContext, useContext, useEffect, useState } from 'react';

import { useLocation, useNavigate } from 'react-router';

import { RessursStatus, type Ressurs } from '@navikt/familie-typer';
import { byggTomRessurs, hentDataFraRessurs } from '@navikt/familie-typer';

import useBehandlingApi from './useBehandlingApi';
import useBehandlingssteg from './useBehandlingssteg';
import { saksbehandlerHarKunLesevisning } from './utils';
import { useAppContext } from '../../../../context/AppContext';
import useSakOgBehandlingParams from '../../../../hooks/useSakOgBehandlingParams';
import {
    BehandlerRolle,
    BehandlingStatus,
    BehandlingÅrsak,
    type BehandlingSteg,
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
import { useFagsakContext } from '../../FagsakContext';
import {
    erViPåUdefinertFagsakSide,
    erViPåUlovligSteg,
    finnSideForBehandlingssteg,
    hentTrinnForBehandling,
    KontrollertStatus,
    sider,
    type ISide,
    type ITrinn,
    type SideId,
} from '../sider/sider';

interface BehandlingContextValue {
    vurderErLesevisning: (sjekkTilgangTilEnhet?: boolean, skalIgnorereOmEnhetErMidlertidig?: boolean) => boolean;
    forrigeÅpneSide: ISide | undefined;
    hentStegPåÅpenBehandling: () => BehandlingSteg | undefined;
    leggTilBesøktSide: (besøktSide: SideId) => void;
    settIkkeKontrollerteSiderTilManglerKontroll: () => void;
    søkersMålform: Målform;
    trinnPåBehandling: { [sideId: string]: ITrinn };
    åpenBehandling: Ressurs<IBehandling>;
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

export const BehandlingProvider = ({ children }: React.PropsWithChildren) => {
    const { fagsakId } = useSakOgBehandlingParams();
    const { hentMinimalFagsak } = useFagsakContext();
    const [åpenBehandling, privatSettÅpenBehandling] = useState<Ressurs<IBehandling>>(byggTomRessurs());
    const [åpenHøyremeny, settÅpenHøyremeny] = useState(true);
    const [åpenVenstremeny, settÅpenVenstremeny] = useState(true);

    const settÅpenBehandling = (behandling: Ressurs<IBehandling>, oppdaterMinimalFagsak = true) => {
        if (oppdaterMinimalFagsak && fagsakId) {
            hentMinimalFagsak(fagsakId, false);
        }
        privatSettÅpenBehandling(behandling);
        settBehandlingsstegSubmitressurs(byggTomRessurs());
    };

    const {
        submitRessurs: behandlingsstegSubmitressurs,
        vilkårsvurderingNesteOnClick,
        behandlingresultatNesteOnClick,
        foreslåVedtakNesteOnClick,
        settSubmitRessurs: settBehandlingsstegSubmitressurs,
    } = useBehandlingssteg(settÅpenBehandling, hentDataFraRessurs(åpenBehandling));

    const { opprettBehandling, logg, hentLogg, oppdaterRegisteropplysninger } = useBehandlingApi(
        åpenBehandling,
        settÅpenBehandling
    );

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
        const siderPåBehandling =
            åpenBehandling.status === RessursStatus.SUKSESS ? hentTrinnForBehandling(åpenBehandling.data) : [];

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

        automatiskNavigeringTilSideForSteg();
    }, [åpenBehandling]);

    useEffect(() => {
        settForrigeÅpneSide(Object.values(sider).find((side: ISide) => location.pathname.includes(side.href)));
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
        return hentDataFraRessurs(åpenBehandling)?.steg;
    };

    const vurderErLesevisning = (sjekkTilgangTilEnhet = true, skalIgnorereOmEnhetErMidlertidig = false): boolean => {
        const åpenBehandlingData = hentDataFraRessurs(åpenBehandling);
        if (
            åpenBehandlingData?.behandlingPåVent ||
            åpenBehandlingData?.status === BehandlingStatus.SATT_PÅ_MASKINELL_VENT
        ) {
            return true;
        }
        if (erBehandleneEnhetMidlertidig && !skalIgnorereOmEnhetErMidlertidig) {
            return true;
        }

        const innloggetSaksbehandlerSkrivetilgang = harInnloggetSaksbehandlerSkrivetilgang();
        const innloggetSaksbehandlerHarSuperbrukerTilgang = harInnloggetSaksbehandlerSuperbrukerTilgang();

        const behandlingsårsak = åpenBehandlingData?.årsak;
        const behandlingsårsakErÅpenForAlleMedTilgangTilÅOppretteÅrsak =
            behandlingsårsak === BehandlingÅrsak.KORREKSJON_VEDTAKSBREV;

        const saksbehandlerHarTilgangTilEnhet =
            innloggetSaksbehandlerHarSuperbrukerTilgang ||
            behandlingsårsakErÅpenForAlleMedTilgangTilÅOppretteÅrsak ||
            harTilgangTilEnhet(
                åpenBehandlingData?.arbeidsfordelingPåBehandling.behandlendeEnhetId ?? '',
                innloggetSaksbehandler?.groups ?? []
            );

        const steg = åpenBehandlingData?.steg;
        const status = åpenBehandlingData?.status;

        return saksbehandlerHarKunLesevisning(
            innloggetSaksbehandlerSkrivetilgang,
            saksbehandlerHarTilgangTilEnhet,
            steg,
            status,
            sjekkTilgangTilEnhet
        );
    };

    const automatiskNavigeringTilSideForSteg = () => {
        if (åpenBehandling.status === RessursStatus.SUKSESS) {
            const sideForSteg: ISide | undefined = finnSideForBehandlingssteg(åpenBehandling.data);

            if (
                (erViPåUdefinertFagsakSide(location.pathname) || erViPåUlovligSteg(location.pathname, sideForSteg)) &&
                sideForSteg
            ) {
                navigate(`/fagsak/${fagsakId}/${åpenBehandling.data.behandlingId}/${sideForSteg.href}`);
            }
        }
    };

    const søkersMålform: Målform =
        åpenBehandling.status === RessursStatus.SUKSESS
            ? (åpenBehandling.data.personer.find(person => person.type === PersonType.SØKER)?.målform ?? Målform.NB)
            : Målform.NB;

    const kanBeslutteVedtak =
        åpenBehandling.status === RessursStatus.SUKSESS &&
        åpenBehandling.data.status === BehandlingStatus.FATTER_VEDTAK &&
        BehandlerRolle.BESLUTTER === hentSaksbehandlerRolle() &&
        innloggetSaksbehandler?.email !== åpenBehandling.data.endretAv;

    const erBehandleneEnhetMidlertidig =
        åpenBehandling.status === RessursStatus.SUKSESS &&
        åpenBehandling.data.arbeidsfordelingPåBehandling.behandlendeEnhetId === MIDLERTIDIG_BEHANDLENDE_ENHET_ID;

    const erBehandlingAvsluttet =
        åpenBehandling.status === RessursStatus.SUKSESS && åpenBehandling.data.status === BehandlingStatus.AVSLUTTET;

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
                åpenBehandling,
                opprettBehandling,
                logg,
                hentLogg,
                behandlingsstegSubmitressurs,
                vilkårsvurderingNesteOnClick,
                behandlingresultatNesteOnClick,
                settÅpenBehandling,
                oppdaterRegisteropplysninger,
                foreslåVedtakNesteOnClick,
                behandlingPåVent: hentDataFraRessurs(åpenBehandling)?.behandlingPåVent,
                erBehandleneEnhetMidlertidig,
                åpenHøyremeny,
                settÅpenHøyremeny,
                åpenVenstremeny,
                settÅpenVenstremeny,
                erBehandlingAvsluttet,
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
