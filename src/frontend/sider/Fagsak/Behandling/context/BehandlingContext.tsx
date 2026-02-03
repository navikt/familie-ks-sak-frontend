import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';

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
    BehandlingÅrsak,
    type IBehandling,
    type IBehandlingPåVent,
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
} from '../sider/sider';

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
    logg: Ressurs<ILogg[]>;
    hentLogg: () => void;
    behandlingsstegSubmitressurs: Ressurs<IBehandling>;
    vilkårsvurderingNesteOnClick: () => void;
    behandlingresultatNesteOnClick: () => void;
    settÅpenBehandling: (behandling: Ressurs<IBehandling>, oppdaterMinimalFagsak?: boolean) => void;
    foreslåVedtakNesteOnClick: (
        settVisModal: (visModal: boolean) => void,
        erUlagretNyFeilutbetaltValuta: boolean,
        erUlagretNyRefusjonEøsPeriode: boolean,
        erSammensattKontrollsak: boolean
    ) => void;
    behandlingPåVent: IBehandlingPåVent | undefined;
}

const BehandlingContext = createContext<BehandlingContextValue | undefined>(undefined);

export const BehandlingProvider = ({ behandling, children }: Props) => {
    const { fagsakId } = useSakOgBehandlingParams();
    const { settBehandlingRessurs } = useHentOgSettBehandlingContext();

    const {
        submitRessurs: behandlingsstegSubmitressurs,
        vilkårsvurderingNesteOnClick,
        behandlingresultatNesteOnClick,
        foreslåVedtakNesteOnClick,
    } = useBehandlingssteg(settBehandlingRessurs, behandling);

    const { logg, hentLogg } = useBehandlingApi();

    const {
        harInnloggetSaksbehandlerSkrivetilgang,
        harInnloggetSaksbehandlerSuperbrukerTilgang,
        innloggetSaksbehandler,
        hentSaksbehandlerRolle,
    } = useAppContext();

    const navigate = useNavigate();
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

        automatiskNavigeringTilSideForSteg();
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

    const automatiskNavigeringTilSideForSteg = () => {
        const sideForSteg: ISide | undefined = finnSideForBehandlingssteg(behandling);

        if (
            (erViPåUdefinertFagsakSide(location.pathname) || erViPåUlovligSteg(location.pathname, sideForSteg)) &&
            sideForSteg
        ) {
            navigate(`/fagsak/${fagsakId}/${behandling.behandlingId}/${sideForSteg.href}`, { replace: true });
        }
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
                logg,
                hentLogg,
                behandlingsstegSubmitressurs,
                vilkårsvurderingNesteOnClick,
                behandlingresultatNesteOnClick,
                foreslåVedtakNesteOnClick,
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
