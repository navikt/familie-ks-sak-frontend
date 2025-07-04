import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type PropsWithChildren,
} from 'react';

import type { AxiosError } from 'axios';
import { useNavigate } from 'react-router';

import type { SortState } from '@navikt/ds-react';
import { useHttp } from '@navikt/familie-http';
import { Valideringsstatus } from '@navikt/familie-skjema';
import {
    byggFeiletRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    RessursStatus,
} from '@navikt/familie-typer';
import type { Ressurs } from '@navikt/familie-typer';

import { initialOppgaveFelter, type IOppgaveFelt, type IOppgaveFelter } from './oppgavefelter';
import {
    mapIOppgaverTilOppgaveRad,
    sorterEtterNøkkel,
    Sorteringsnøkkel,
    type IOppgaveRad,
} from './utils';
import { useAppContext } from '../../context/AppContext';
import { AlertType, ToastTyper } from '../../komponenter/Toast/typer';
import type { IMinimalFagsak } from '../../typer/fagsak';
import {
    BehandlingstypeFilter,
    EnhetFilter,
    OppgavetypeFilter,
    SaksbehandlerFilter,
    type IFinnOppgaveRequest,
    type IHentOppgaveDto,
    type IOppgave,
} from '../../typer/oppgave';
import { erIsoStringGyldig } from '../../utils/dato';
import { hentFnrFraOppgaveIdenter } from '../../utils/oppgave';
import { hentFrontendFeilmelding } from '../../utils/ressursUtils';
import {
    hentNesteSorteringsrekkefølge,
    hentSortState,
    Sorteringsrekkefølge,
} from '../../utils/tabell';
import { useOpprettEllerHentFagsak } from '../Fagsak/useOpprettEllerHentFagsak';

const OPPGAVEBENK_SORTERINGSNØKKEL = 'OPPGAVEBENK_SORTERINGSNØKKEL';
export const oppgaveSideLimit = 15;

const maksAntallOppgaver = 150;

interface OppgavebenkContextValue {
    fordelOppgave: (oppgave: IOppgave, saksbehandler: string) => void;
    hentOppgaver: () => void;
    oppgaveFelter: IOppgaveFelter;
    oppgaver: Ressurs<IHentOppgaveDto>;
    side: number;
    settSide: (side: number) => void;
    settVerdiPåOppgaveFelt: (oppgaveFelt: IOppgaveFelt, nyVerdi: string) => void;
    tilbakestillFordelingPåOppgave: (oppgave: IOppgave) => void;
    tilbakestillOppgaveFelter: () => void;
    validerSkjema: () => boolean;
    sortering: SortState | undefined;
    settOgLagreSortering: (sorteringsnøkkel: Sorteringsnøkkel) => void;
    sorterteOppgaverader: IOppgaveRad[];
}

const OppgavebenkContext = createContext<OppgavebenkContextValue | undefined>(undefined);

export const OppgavebenkProvider = (props: PropsWithChildren) => {
    const navigate = useNavigate();
    const { innloggetSaksbehandler, settToast } = useAppContext();
    const { request } = useHttp();
    const { opprettEllerHentFagsak } = useOpprettEllerHentFagsak();

    const [hentOppgaverVedSidelast, settHentOppgaverVedSidelast] = useState(true);
    const [side, settSide] = useState<number>(1);

    const [oppgaver, settOppgaver] =
        React.useState<Ressurs<IHentOppgaveDto>>(byggTomRessurs<IHentOppgaveDto>());

    const [oppgaveFelter, settOppgaveFelter] = useState<IOppgaveFelter>(
        initialOppgaveFelter(innloggetSaksbehandler)
    );

    const oppgaverader: IOppgaveRad[] = useMemo(() => {
        return oppgaver.status === RessursStatus.SUKSESS && oppgaver.data.oppgaver.length > 0
            ? mapIOppgaverTilOppgaveRad(oppgaver.data.oppgaver, innloggetSaksbehandler)
            : [];
    }, [oppgaver]);

    const lagretSortering = localStorage.getItem(OPPGAVEBENK_SORTERINGSNØKKEL);

    const [sortering, settSortering] = useState<SortState | undefined>(
        lagretSortering && lagretSortering !== '"{}"' && lagretSortering !== '"undefined"'
            ? JSON.parse(lagretSortering)
            : hentSortState(Sorteringsrekkefølge.STIGENDE, Sorteringsnøkkel.OPPRETTET_TIDSPUNKT)
    );

    const [sorterteOppgaverader, settSorterteOppgaverader] = useState<IOppgaveRad[]>(oppgaverader);
    useEffect(() => {
        settSorterteOppgaverader(
            oppgaverader.sort((a, b) => {
                if (sortering) {
                    return sortering.direction === Sorteringsrekkefølge.STIGENDE
                        ? sorterEtterNøkkel(b, a, sortering.orderBy as Sorteringsnøkkel)
                        : sorterEtterNøkkel(a, b, sortering.orderBy as Sorteringsnøkkel);
                }
                return 1;
            })
        );
    }, [oppgaverader, sortering]);

    const settOgLagreSortering = (sorteringsnøkkel: Sorteringsnøkkel): void => {
        const nyRekkefølge =
            sorteringsnøkkel === sortering?.orderBy
                ? hentNesteSorteringsrekkefølge(sortering.direction as Sorteringsrekkefølge)
                : Sorteringsrekkefølge.STIGENDE;
        const nySortering = hentSortState(nyRekkefølge, sorteringsnøkkel);
        localStorage.setItem(OPPGAVEBENK_SORTERINGSNØKKEL, JSON.stringify(nySortering || {}));
        settSortering(nySortering);
    };

    useEffect(() => {
        settOppgaveFelter(initialOppgaveFelter(innloggetSaksbehandler));
    }, [innloggetSaksbehandler]);

    useEffect(() => {
        if (hentOppgaverVedSidelast && innloggetSaksbehandler) {
            if (
                Object.values(oppgaveFelter).filter(
                    (oppgaveFelt: IOppgaveFelt) =>
                        oppgaveFelt.filter?.initialValue !== oppgaveFelt.filter?.selectedValue
                ).length > 0
            ) {
                hentOppgaver();
            }
            settHentOppgaverVedSidelast(false);
        }
    }, [oppgaveFelter]);

    const hentOppgaveFelt = (nøkkel: string) => {
        return oppgaveFelter[nøkkel];
    };

    const oppdaterOppgaveFeltILocalStorage = (oppgaveFelt: IOppgaveFelt, nyVerdi: string) => {
        const oppgaveFelterLocalStorage = JSON.parse(
            localStorage.getItem('oppgaveFeltVerdier') || '{}'
        );
        oppgaveFelterLocalStorage[oppgaveFelt.nøkkel] = nyVerdi;
        localStorage.setItem('oppgaveFeltVerdier', JSON.stringify(oppgaveFelterLocalStorage));
    };

    const tilbakestillOppgaveFeltILocalStorage = () => {
        localStorage.removeItem('oppgaveFeltVerdier');
    };

    const oppdaterOppgave = (oppdatertOppgave: IOppgave) => {
        if (oppgaver.status === RessursStatus.SUKSESS) {
            const nyOppgaveliste = oppgaver.data.oppgaver.map(oppgave => {
                if (oppdatertOppgave.id === oppgave.id) {
                    return oppdatertOppgave;
                } else {
                    return oppgave;
                }
            });
            settOppgaver({
                status: oppgaver.status,
                data: {
                    ...oppgaver.data,
                    oppgaver: nyOppgaveliste,
                },
            });
        }
    };

    const settVerdiPåOppgaveFelt = (oppgaveFelt: IOppgaveFelt, nyVerdi: string) => {
        if (oppgaveFelt.filter) {
            const oppdaterteOppgaveFelter = {
                ...oppgaveFelter,
                [oppgaveFelt.nøkkel]: {
                    ...oppgaveFelt,
                    filter: {
                        ...oppgaveFelt.filter,
                        selectedValue: nyVerdi,
                    },
                },
            };
            oppdaterOppgaveFeltILocalStorage(oppgaveFelt, nyVerdi);

            settOppgaveFelter(oppdaterteOppgaveFelter);

            navigate({
                search: Object.values(oppdaterteOppgaveFelter)
                    .filter(
                        (mapOppgaveFelt: IOppgaveFelt) =>
                            mapOppgaveFelt.filter?.selectedValue !==
                            mapOppgaveFelt.filter?.initialValue
                    )
                    .map((mapOppgaveFelt: IOppgaveFelt) => {
                        return `${mapOppgaveFelt.nøkkel}=${mapOppgaveFelt?.filter?.selectedValue}`;
                    })
                    .join('&'),
            });
        }
    };

    const tilbakestillOppgaveFelter = () => {
        tilbakestillOppgaveFeltILocalStorage();
        settOppgaveFelter(initialOppgaveFelter(innloggetSaksbehandler));
    };

    const fordelOppgave = (oppgave: IOppgave, saksbehandler: string) => {
        request<void, string>({
            method: 'POST',
            url: `/familie-ks-sak/api/oppgave/${oppgave.id}/fordel?saksbehandler=${saksbehandler}`,
            påvirkerSystemLaster: true,
        })
            .then((oppgaveId: Ressurs<string>) => {
                if (oppgaveId.status === RessursStatus.SUKSESS) {
                    const oppgavetypeFilter =
                        OppgavetypeFilter[oppgave.oppgavetype as keyof typeof OppgavetypeFilter];
                    if (
                        oppgavetypeFilter === OppgavetypeFilter.JFR ||
                        oppgavetypeFilter === OppgavetypeFilter.BEH_SED
                    ) {
                        navigate(`/oppgaver/journalfor/${oppgave.id}`);
                    } else {
                        if (oppgave.behandlingstype === BehandlingstypeFilter.ae0161) {
                            // tilbakekreving
                            gåTilTilbakekreving(oppgave);
                        } else if (oppgave.aktoerId) {
                            opprettEllerHentFagsak({
                                personIdent: null,
                                aktørId: oppgave.aktoerId,
                            });
                        }
                    }
                } else {
                    settToast(ToastTyper.OPPGAVE_PLUKKET, {
                        alertType: AlertType.ERROR,
                        tekst: hentFrontendFeilmelding(oppgaveId) ?? 'Fordeling av oppgave feilet',
                    });
                }
            })
            .catch((_error: AxiosError) => {
                settToast(ToastTyper.OPPGAVE_PLUKKET, {
                    alertType: AlertType.ERROR,
                    tekst: 'Fordeling av oppgave feilet',
                });
            });
    };

    const tilbakestillFordelingPåOppgave = (oppgave: IOppgave) => {
        request<string, IOppgave>({
            method: 'POST',
            url: `/familie-ks-sak/api/oppgave/${oppgave.id}/tilbakestill`,
            påvirkerSystemLaster: true,
        })
            .then((oppgaverRes: Ressurs<IOppgave>) => {
                if (oppgaverRes.status === RessursStatus.SUKSESS) {
                    oppdaterOppgave(oppgaverRes.data);
                    settToast(ToastTyper.OPPGAVE_TILBAKESTILT, {
                        alertType: AlertType.SUCCESS,
                        tekst: 'Oppgave er tilbakestilt',
                    });
                } else {
                    settToast(ToastTyper.OPPGAVE_TILBAKESTILT, {
                        alertType: AlertType.ERROR,
                        tekst:
                            hentFrontendFeilmelding(oppgaverRes) ??
                            'Tilbakestilling av oppgave feilet',
                    });
                }
            })
            .catch((_error: AxiosError) => {
                settToast(ToastTyper.OPPGAVE_TILBAKESTILT, {
                    alertType: AlertType.ERROR,
                    tekst: 'Tilbakestilling av oppgave feilet',
                });
            });
    };

    const validerSkjema = () => {
        const opprettetTidspunktGyldig =
            oppgaveFelter.opprettetTidspunkt.filter?.selectedValue === '' ||
            erIsoStringGyldig(oppgaveFelter.opprettetTidspunkt.filter?.selectedValue);

        const fristGyldig =
            oppgaveFelter.fristFerdigstillelse.filter?.selectedValue === '' ||
            erIsoStringGyldig(oppgaveFelter.fristFerdigstillelse.filter?.selectedValue);

        const enhetGyldig =
            oppgaveFelter.tildeltEnhetsnr.filter?.selectedValue !== EnhetFilter.VELG;

        const oppdaterteOppgaveFelter = {
            ...oppgaveFelter,
            opprettetTidspunkt: {
                ...oppgaveFelter.opprettetTidspunkt,
                valideringsstatus: opprettetTidspunktGyldig
                    ? Valideringsstatus.OK
                    : Valideringsstatus.FEIL,
                feilmelding: opprettetTidspunktGyldig ? '' : 'Dato må skrives på format ddmmåå',
            },
            fristFerdigstillelse: {
                ...oppgaveFelter.fristFerdigstillelse,
                valideringsstatus: fristGyldig ? Valideringsstatus.OK : Valideringsstatus.FEIL,
                feilmelding: fristGyldig ? '' : 'Dato må skrives på format ddmmåå',
            },
            tildeltEnhetsnr: {
                ...oppgaveFelter.tildeltEnhetsnr,
                valideringsstatus: enhetGyldig ? Valideringsstatus.OK : Valideringsstatus.FEIL,
                feilmelding: enhetGyldig ? '' : 'Du må velge enhet',
            },
        };

        const erGyldig = opprettetTidspunktGyldig && fristGyldig && enhetGyldig;
        settOppgaveFelter(oppdaterteOppgaveFelter);

        return erGyldig;
    };

    const hentOppgaver = () => {
        settOppgaver(byggHenterRessurs());

        const saksbehandlerFilter = hentOppgaveFelt('tilordnetRessurs').filter?.selectedValue;
        let tildeltRessurs;
        switch (saksbehandlerFilter) {
            case SaksbehandlerFilter.FORDELTE:
                tildeltRessurs = true;
                break;
            case SaksbehandlerFilter.UFORDELTE:
                tildeltRessurs = false;
                break;
            default:
                tildeltRessurs = undefined;
        }

        hentOppgaverFraBackend(
            hentOppgaveFelt('behandlingstype').filter?.selectedValue,
            hentOppgaveFelt('oppgavetype').filter?.selectedValue,
            hentOppgaveFelt('tildeltEnhetsnr').filter?.selectedValue,
            hentOppgaveFelt('fristFerdigstillelse').filter?.selectedValue,
            hentOppgaveFelt('opprettetTidspunkt').filter?.selectedValue,
            saksbehandlerFilter === SaksbehandlerFilter.INNLOGGET
                ? innloggetSaksbehandler?.navIdent
                : undefined,
            tildeltRessurs
        ).then((oppgaverRessurs: Ressurs<IHentOppgaveDto>) => {
            settOppgaver(oppgaverRessurs);
        });
    };

    const hentOppgaverFraBackend = (
        behandlingstype?: string,
        oppgavetype?: string,
        enhet?: string,
        frist?: string,
        registrertDato?: string,
        tilordnetRessurs?: string,
        tildeltRessurs?: boolean
    ): Promise<Ressurs<IHentOppgaveDto>> => {
        const erstattAlleMedUndefined = (filter: string | undefined) =>
            filter === 'ALLE' ? undefined : filter;

        const finnOppgaveRequest: IFinnOppgaveRequest = {
            behandlingstype: erstattAlleMedUndefined(behandlingstype),
            oppgavetype: erstattAlleMedUndefined(oppgavetype),
            enhet: erstattAlleMedUndefined(enhet)?.replace('E', ''),
            tilordnetRessurs,
            tildeltRessurs,
            opprettetFomTidspunkt:
                registrertDato && registrertDato !== ''
                    ? `${registrertDato}T00:00:00.000`
                    : undefined,
            opprettetTomTidspunkt:
                registrertDato && registrertDato !== ''
                    ? `${registrertDato}T23:59:59.999`
                    : undefined,
            fristFomDato: frist && frist !== '' ? frist : undefined,
            fristTomDato: frist && frist !== '' ? frist : undefined,
            limit: maksAntallOppgaver,
            offset: 0,
        };

        return request<IFinnOppgaveRequest, IHentOppgaveDto>({
            data: finnOppgaveRequest,
            method: 'POST',
            url: `/familie-ks-sak/api/oppgave/hent-oppgaver`,
        })
            .then((oppgaverRes: Ressurs<IHentOppgaveDto>) => {
                return oppgaverRes;
            })
            .catch((_error: AxiosError) => {
                return byggFeiletRessurs('Ukjent ved innhenting av oppgaver');
            });
    };

    const gåTilTilbakekreving = (oppgave: IOppgave) => {
        const brukerident = hentFnrFraOppgaveIdenter(oppgave.identer);
        if (brukerident) {
            request<{ personIdent: string }, IMinimalFagsak | undefined>({
                method: 'POST',
                url: `/familie-ks-sak/api/fagsaker/hent-fagsak-paa-person`,
                data: {
                    personIdent: brukerident,
                },
            }).then((fagsak: Ressurs<IMinimalFagsak | undefined>) => {
                if (fagsak.status === RessursStatus.SUKSESS && !!fagsak.data) {
                    window.location.href = `/redirect/familie-tilbake/fagsystem/KS/fagsak/${fagsak.data.id}/behandling/${oppgave.saksreferanse}`;
                }
            });
        }
    };

    return (
        <OppgavebenkContext.Provider
            value={{
                fordelOppgave,
                hentOppgaver,
                oppgaveFelter,
                oppgaver,
                side,
                settSide,
                settVerdiPåOppgaveFelt,
                tilbakestillFordelingPåOppgave,
                tilbakestillOppgaveFelter,
                validerSkjema,
                sortering,
                settOgLagreSortering,
                sorterteOppgaverader,
            }}
        >
            {props.children}
        </OppgavebenkContext.Provider>
    );
};

export const useOppgavebenkContext = () => {
    const context = useContext(OppgavebenkContext);
    if (context === undefined) {
        throw new Error('useOppgavebenkContext må brukes innenfor en OppgavebenkProvider');
    }
    return context;
};
