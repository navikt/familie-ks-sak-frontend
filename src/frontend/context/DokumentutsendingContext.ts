import { useEffect, useState } from 'react';

import createUseContext from 'constate';
import deepEqual from 'deep-equal';

import type { FeltState } from '@navikt/familie-skjema';
import { feil, ok, useFelt, useSkjema } from '@navikt/familie-skjema';
import { RessursStatus } from '@navikt/familie-typer';

import { useFagsakContext } from './fagsak/FagsakContext';
import useDokument from '../hooks/useDokument';
import { hentEnkeltInformasjonsbrevRequest } from '../komponenter/Fagsak/Dokumentutsending/Informasjonsbrev/enkeltInformasjonsbrevUtils';
import { Informasjonsbrev } from '../komponenter/Felleskomponenter/Hendelsesoversikt/BrevModul/typer';
import type { IManueltBrevRequestPåFagsak } from '../typer/dokument';
import type { IForelderBarnRelasjon } from '../typer/person';
import { ForelderBarnRelasjonRolle } from '../typer/person';
import type { IBarnMedOpplysninger } from '../typer/søknad';
import { Målform } from '../typer/søknad';
import { Datoformat, isoStringTilFormatertString } from '../utils/dato';
import { hentFrontendFeilmelding } from '../utils/ressursUtils';

export enum DokumentÅrsak {
    KAN_SØKE_EØS = 'KAN_SØKE_EØS',
    TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HAR_FÅTT_EN_SØKNAD_FRA_ANNEN_FORELDER = 'TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HAR_FÅTT_EN_SØKNAD_FRA_ANNEN_FORELDER',
    TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_VARSEL_OM_REVURDERING = 'TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_VARSEL_OM_REVURDERING',
    TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HENTER_IKKE_REGISTEROPPLYSNINGER = 'TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HENTER_IKKE_REGISTEROPPLYSNINGER',
    KAN_HA_RETT_TIL_PENGESTØTTE_FRA_NAV = 'KAN_HA_RETT_TIL_PENGESTØTTE_FRA_NAV',
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
};

const hentBarnMedOpplysningerFraBruker = () => {
    const { bruker: brukerRessurs } = useFagsakContext();

    if (brukerRessurs.status === RessursStatus.SUKSESS) {
        return (
            brukerRessurs.data.forelderBarnRelasjon
                .filter(
                    (relasjon: IForelderBarnRelasjon) =>
                        relasjon.relasjonRolle === ForelderBarnRelasjonRolle.BARN
                )
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
    } else return [];
};

export const [DokumentutsendingProvider, useDokumentutsending] = createUseContext(
    ({ fagsakId }: { fagsakId: number }) => {
        const { bruker, manuelleBrevmottakerePåFagsak, settManuelleBrevmottakerePåFagsak } =
            useFagsakContext();
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

        const {
            skjema,
            kanSendeSkjema,
            onSubmit,
            nullstillSkjema: nullstillHeleSkjema,
            settVisfeilmeldinger,
        } = useSkjema<
            {
                årsak: DokumentÅrsak | undefined;
                målform: Målform | undefined;
                barnIBrev: IBarnMedOpplysninger[];
            },
            string
        >({
            felter: {
                årsak: årsak,
                målform: målform,
                barnIBrev: barnIBrev,
            },
            skjemanavn: 'Dokumentutsending',
        });

        const nullstillSkjemaUtenomÅrsak = () => {
            skjema.felter.målform.nullstill();
            skjema.felter.barnIBrev.nullstill();
        };

        const nullstillSkjema = () => {
            nullstillHeleSkjema();
        };

        useEffect(() => {
            nullstillSkjemaUtenomÅrsak();
        }, [årsak.verdi, bruker.status]);

        const hentSkjemaData = (): IManueltBrevRequestPåFagsak => {
            const dokumentÅrsak = skjema.felter.årsak.verdi;
            if (bruker.status === RessursStatus.SUKSESS && dokumentÅrsak) {
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
                }
            } else {
                throw Error('Bruker ikke hentet inn og vi kan ikke sende inn skjema');
            }
        };

        const skjemaErLåst = () =>
            skjema.submitRessurs.status === RessursStatus.HENTER ||
            hentetDokument.status === RessursStatus.HENTER;

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

        const hentBarnIBrevSkjemaData = (
            brevmal: Informasjonsbrev,
            målform: Målform
        ): IManueltBrevRequestPåFagsak => {
            if (bruker.status === RessursStatus.SUKSESS) {
                const barnIBrev = skjema.felter.barnIBrev.verdi.filter(barn => barn.merket);

                return {
                    mottakerIdent: bruker.data.personIdent,
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
                    mottakerNavn: bruker.data.navn,
                    brevmal: brevmal,
                    manuelleBrevmottakere: manuelleBrevmottakerePåFagsak,
                };
            } else {
                throw Error('Bruker ikke hentet inn og vi kan ikke sende inn skjema');
            }
        };

        const hentSkjemaFeilmelding = () =>
            hentFrontendFeilmelding(hentetDokument) ||
            hentFrontendFeilmelding(skjema.submitRessurs);

        return {
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
            visForhåndsvisningBeskjed: () =>
                !deepEqual(hentSkjemaData(), sistBrukteDataVedForhåndsvisning),
            visInnsendtBrevModal,
            skjema,
            nullstillSkjema,
        };
    }
);
