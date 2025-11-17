import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';

import deepEqual from 'deep-equal';

import type { FeltState, ISkjema } from '@navikt/familie-skjema';
import { feil, ok, useFelt, useSkjema, Valideringsstatus } from '@navikt/familie-skjema';
import { type Ressurs, RessursStatus } from '@navikt/familie-typer';

import { hentEnkeltInformasjonsbrevRequest } from './Informasjonsbrev/enkeltInformasjonsbrevUtils';
import useDokument from '../../../hooks/useDokument';
import { Informasjonsbrev } from '../../../komponenter/Hendelsesoversikt/BrevModul/typer';
import type { IManueltBrevRequestPåFagsak } from '../../../typer/dokument';
import { ForelderBarnRelasjonRolle, type IForelderBarnRelasjon } from '../../../typer/person';
import { type IBarnMedOpplysninger, Målform } from '../../../typer/søknad';
import { Datoformat, isoStringTilFormatertString } from '../../../utils/dato';
import { hentFrontendFeilmelding } from '../../../utils/ressursUtils';
import { useBrukerContext } from '../BrukerContext';
import { useManuelleBrevmottakerePåFagsakContext } from '../ManuelleBrevmottakerePåFagsakContext';

export enum DokumentÅrsak {
    KAN_SØKE_EØS = 'KAN_SØKE_EØS',
    TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HAR_FÅTT_EN_SØKNAD_FRA_ANNEN_FORELDER = 'TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HAR_FÅTT_EN_SØKNAD_FRA_ANNEN_FORELDER',
    TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_VARSEL_OM_REVURDERING = 'TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_VARSEL_OM_REVURDERING',
    TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HENTER_IKKE_REGISTEROPPLYSNINGER = 'TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HENTER_IKKE_REGISTEROPPLYSNINGER',
    KAN_HA_RETT_TIL_PENGESTØTTE_FRA_NAV = 'KAN_HA_RETT_TIL_PENGESTØTTE_FRA_NAV',
    INNHENTE_OPPLYSNINGER_KLAGE = 'INNHENTE_OPPLYSNINGER_KLAGE',
}

export const dokumentÅrsak: Record<DokumentÅrsak, string> = {
    KAN_SØKE_EØS: 'Kan søke EØS',
    TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HAR_FÅTT_EN_SØKNAD_FRA_ANNEN_FORELDER:
        'Informasjon til forelder omfattet norsk lovgivning - har fått en søknad fra annen forelder',
    TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_VARSEL_OM_REVURDERING:
        'Informasjon til forelder omfattet av norsk lovgivning - varsel om revurdering',
    TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HENTER_IKKE_REGISTEROPPLYSNINGER:
        'Informasjon til forelder omfattet av norsk lovgivning - henter ikke registeropplysninger',
    KAN_HA_RETT_TIL_PENGESTØTTE_FRA_NAV: 'Kan ha rett til pengestøtte fra Nav',
    INNHENTE_OPPLYSNINGER_KLAGE: 'Innhente opplysninger klage',
};

const hentBarnMedOpplysningerFraBruker = () => {
    const { bruker } = useBrukerContext();

    return (
        bruker.forelderBarnRelasjon
            .filter((relasjon: IForelderBarnRelasjon) => relasjon.relasjonRolle === ForelderBarnRelasjonRolle.BARN)
            .map(
                (relasjon: IForelderBarnRelasjon): IBarnMedOpplysninger => ({
                    merket: false,
                    ident: relasjon.personIdent,
                    navn: relasjon.navn,
                    fødselsdato: relasjon.fødselsdato,
                    manueltRegistrert: false,
                    erFolkeregistrert: true,
                })
            ) ?? []
    );
};

interface Props extends PropsWithChildren {
    fagsakId: number;
}

interface DokumentutsendingSkjema {
    årsak: DokumentÅrsak | undefined;
    målform: Målform | undefined;
    barnIBrev: IBarnMedOpplysninger[];
    fritekstAvsnitt: string;
}

interface DokumentutsendingContextValue {
    fagsakId: number;
    hentForhåndsvisningPåFagsak: () => void;
    hentBarnMedOpplysningerFraBruker: () => IBarnMedOpplysninger[];
    hentSkjemaFeilmelding: () => string | undefined;
    hentetDokument: Ressurs<string>;
    sendBrevPåFagsak: () => void;
    senderBrev: () => boolean;
    settVisInnsendtBrevModal: (vis: boolean) => void;
    settVisfeilmeldinger: (vis: boolean) => void;
    skjemaErLåst: () => boolean;
    visForhåndsvisningBeskjed: () => boolean;
    visInnsendtBrevModal: boolean;
    skjema: ISkjema<DokumentutsendingSkjema, string>;
    nullstillSkjema: () => void;
}

const DokumentutsendingContext = createContext<DokumentutsendingContextValue | undefined>(undefined);

export const DokumentutsendingProvider = ({ fagsakId, children }: Props) => {
    const { bruker } = useBrukerContext();
    const { manuelleBrevmottakerePåFagsak, settManuelleBrevmottakerePåFagsak } =
        useManuelleBrevmottakerePåFagsakContext();
    const [visInnsendtBrevModal, settVisInnsendtBrevModal] = useState(false);
    const { hentForhåndsvisning, hentetDokument } = useDokument();

    const [sistBrukteDataVedForhåndsvisning, settSistBrukteDataVedForhåndsvisning] = useState<
        IManueltBrevRequestPåFagsak | undefined
    >(undefined);

    const målform = useFelt<Målform | undefined>({
        verdi: Målform.NB,
    });

    const årsak = useFelt<DokumentÅrsak | undefined>({
        verdi: undefined,
        valideringsfunksjon: (felt: FeltState<DokumentÅrsak | undefined>) => {
            return felt.verdi ? ok(felt) : feil(felt, 'Du må velge en årsak');
        },
    });

    const barnMedOpplysningerFraBruker = hentBarnMedOpplysningerFraBruker();

    const barnIBrev = useFelt<IBarnMedOpplysninger[]>({
        verdi: barnMedOpplysningerFraBruker,
        valideringsfunksjon: felt => {
            return felt.verdi.some((barn: IBarnMedOpplysninger) => barn.merket)
                ? ok(felt)
                : feil(felt, 'Du må velge barn');
        },
        avhengigheter: { årsakFelt: årsak },
        skalFeltetVises: avhengigheter =>
            [
                DokumentÅrsak.TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HAR_FÅTT_EN_SØKNAD_FRA_ANNEN_FORELDER,
                DokumentÅrsak.TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_VARSEL_OM_REVURDERING,
                DokumentÅrsak.TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HENTER_IKKE_REGISTEROPPLYSNINGER,
                DokumentÅrsak.KAN_HA_RETT_TIL_PENGESTØTTE_FRA_NAV,
            ].includes(avhengigheter.årsakFelt.verdi),
        nullstillVedAvhengighetEndring: false,
    });

    const fritekstAvsnitt = useFelt({
        verdi: '',
        valideringsfunksjon: (felt: FeltState<string>) => {
            return felt.valideringsstatus === Valideringsstatus.FEIL || felt.verdi.length === 0
                ? feil(felt, 'Fritekst avsnitt mangler.')
                : ok(felt);
        },
        avhengigheter: { årsakFelt: årsak },
        skalFeltetVises: avhengigheter => {
            return avhengigheter.årsakFelt.verdi === DokumentÅrsak.INNHENTE_OPPLYSNINGER_KLAGE;
        },
    });

    const {
        skjema,
        kanSendeSkjema,
        onSubmit,
        nullstillSkjema: nullstillHeleSkjema,
        settVisfeilmeldinger,
    } = useSkjema<DokumentutsendingSkjema, string>({
        felter: {
            årsak: årsak,
            målform: målform,
            barnIBrev: barnIBrev,
            fritekstAvsnitt: fritekstAvsnitt,
        },
        skjemanavn: 'Dokumentutsending',
    });

    const nullstillSkjemaUtenomÅrsak = () => {
        skjema.felter.målform.nullstill();
        skjema.felter.barnIBrev.nullstill();
        skjema.felter.fritekstAvsnitt.nullstill();
    };

    const nullstillSkjema = () => {
        nullstillHeleSkjema();
    };

    useEffect(() => {
        nullstillSkjemaUtenomÅrsak();
    }, [årsak.verdi, bruker]);

    const hentSkjemaData = (): IManueltBrevRequestPåFagsak => {
        const dokumentÅrsak = skjema.felter.årsak.verdi;

        switch (dokumentÅrsak) {
            case DokumentÅrsak.KAN_SØKE_EØS:
                return hentEnkeltInformasjonsbrevRequest({
                    bruker: bruker,
                    målform: målform.verdi ?? Målform.NB,
                    brevmal: Informasjonsbrev.INFORMASJONSBREV_KAN_SØKE_EØS,
                    manuelleBrevmottakerePåFagsak,
                });
            case DokumentÅrsak.TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_VARSEL_OM_REVURDERING:
                return hentBarnIBrevSkjemaData(
                    Informasjonsbrev.INFORMASJONSBREV_TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_VARSEL_OM_REVURDERING,
                    målform.verdi ?? Målform.NB
                );
            case DokumentÅrsak.TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HAR_FÅTT_EN_SØKNAD_FRA_ANNEN_FORELDER:
                return hentBarnIBrevSkjemaData(
                    Informasjonsbrev.INFORMASJONSBREV_TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HAR_FÅTT_EN_SØKNAD_FRA_ANNEN_FORELDER,
                    målform.verdi ?? Målform.NB
                );
            case DokumentÅrsak.TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HENTER_IKKE_REGISTEROPPLYSNINGER:
                return hentBarnIBrevSkjemaData(
                    Informasjonsbrev.INFORMASJONSBREV_TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HENTER_IKKE_REGISTEROPPLYSNINGER,
                    målform.verdi ?? Målform.NB
                );
            case DokumentÅrsak.KAN_HA_RETT_TIL_PENGESTØTTE_FRA_NAV:
                return hentBarnIBrevSkjemaData(
                    Informasjonsbrev.INFORMASJONSBREV_KAN_HA_RETT_TIL_PENGESTØTTE_FRA_NAV,
                    målform.verdi ?? Målform.NB
                );
            case DokumentÅrsak.INNHENTE_OPPLYSNINGER_KLAGE:
                return hentInnhenteOpplysningerKlageSkjemaData(målform.verdi ?? Målform.NB);
            case undefined:
                throw Error('Bruker ikke hentet inn og vi kan ikke sende inn skjema');
        }
    };

    const skjemaErLåst = () =>
        skjema.submitRessurs.status === RessursStatus.HENTER || hentetDokument.status === RessursStatus.HENTER;

    const senderBrev = () => skjema.submitRessurs.status === RessursStatus.HENTER;

    const hentForhåndsvisningPåFagsak = () => {
        const skjemaData = hentSkjemaData();
        settSistBrukteDataVedForhåndsvisning(skjemaData);
        hentForhåndsvisning<IManueltBrevRequestPåFagsak>({
            method: 'POST',
            data: skjemaData,
            url: `/familie-ks-sak/api/brev/fagsak/${fagsakId}/forhaandsvis-brev`,
        });
    };

    const sendBrevPåFagsak = () => {
        if (kanSendeSkjema()) {
            onSubmit(
                {
                    method: 'POST',
                    data: hentSkjemaData(),
                    url: `/familie-ks-sak/api/brev/fagsak/${fagsakId}/send-brev`,
                },
                () => {
                    settVisInnsendtBrevModal(true);
                    settManuelleBrevmottakerePåFagsak([]);
                    nullstillSkjema();
                }
            );
        }
    };

    const hentBarnIBrevSkjemaData = (brevmal: Informasjonsbrev, målform: Målform): IManueltBrevRequestPåFagsak => {
        const barnIBrev = skjema.felter.barnIBrev.verdi.filter(barn => barn.merket);

        return {
            mottakerIdent: bruker.personIdent,
            multiselectVerdier: barnIBrev.map(
                barn =>
                    `Barn født ${isoStringTilFormatertString({
                        isoString: barn.fødselsdato,
                        tilFormat: Datoformat.DATO,
                    })}.`
            ),
            barnIBrev: barnIBrev
                .map(barn => barn.ident)
                .filter((ident): ident is string => ident !== undefined && ident !== null),
            mottakerMålform: målform,
            mottakerNavn: bruker.navn,
            brevmal: brevmal,
            manuelleBrevmottakere: manuelleBrevmottakerePåFagsak,
        };
    };

    const hentInnhenteOpplysningerKlageSkjemaData = (målform: Målform): IManueltBrevRequestPåFagsak => {
        return {
            mottakerIdent: bruker.personIdent,
            mottakerNavn: bruker.navn,
            mottakerMålform: målform,
            multiselectVerdier: [],
            barnIBrev: [],
            brevmal: Informasjonsbrev.INFORMASJONSBREV_INNHENTE_OPPLYSNINGER_KLAGE,
            manuelleBrevmottakere: manuelleBrevmottakerePåFagsak,
            fritekstAvsnitt: fritekstAvsnitt.verdi,
        };
    };

    const hentSkjemaFeilmelding = () =>
        hentFrontendFeilmelding(hentetDokument) || hentFrontendFeilmelding(skjema.submitRessurs);

    return (
        <DokumentutsendingContext.Provider
            value={{
                fagsakId,
                hentForhåndsvisningPåFagsak,
                hentBarnMedOpplysningerFraBruker,
                hentSkjemaFeilmelding,
                hentetDokument,
                sendBrevPåFagsak,
                senderBrev,
                settVisInnsendtBrevModal,
                settVisfeilmeldinger,
                skjemaErLåst,
                visForhåndsvisningBeskjed: () => !deepEqual(hentSkjemaData(), sistBrukteDataVedForhåndsvisning),
                visInnsendtBrevModal,
                skjema,
                nullstillSkjema,
            }}
        >
            {children}
        </DokumentutsendingContext.Provider>
    );
};

export const useDokumentutsendingContext = () => {
    const context = useContext(DokumentutsendingContext);
    if (context === undefined) {
        throw new Error('useDokumentutsendingContext må brukes innenfor en DokumentutsendingProvider');
    }
    return context;
};
