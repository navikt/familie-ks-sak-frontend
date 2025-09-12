import { useEffect, useState } from 'react';

import type { Avhengigheter, FeltState } from '@navikt/familie-skjema';
import { feil, ok, useFelt, useSkjema, Valideringsstatus } from '@navikt/familie-skjema';

import type { ISelectOptionMedBrevtekst } from './typer';
import { Brevmal } from './typer';
import { useBehandlingContext } from '../../../sider/Fagsak/Behandling/context/BehandlingContext';
import { Behandlingstype, BehandlingÅrsak, type IBehandling } from '../../../typer/behandling';
import { BehandlingKategori } from '../../../typer/behandlingstema';
import type { IManueltBrevRequestPåBehandling } from '../../../typer/dokument';
import type { IGrunnlagPerson } from '../../../typer/person';
import { PersonType } from '../../../typer/person';
import type { IBarnMedOpplysninger } from '../../../typer/søknad';
import { Målform } from '../../../typer/søknad';
import type { IFritekstFelt } from '../../../utils/fritekstfelter';
import { genererIdBasertPåAndreFritekster, lagInitiellFritekst } from '../../../utils/fritekstfelter';

export const hentMuligeBrevmalerImplementering = (behandling: IBehandling): Brevmal[] => {
    const brevmaler: Brevmal[] = Object.keys(Brevmal) as Brevmal[];
    return brevmaler.filter(brevmal => brevmalKanVelgesForBehandling(brevmal, behandling));
};

const brevmalKanVelgesForBehandling = (brevmal: Brevmal, åpenBehandling: IBehandling): boolean => {
    switch (brevmal) {
        case Brevmal.INNHENTE_OPPLYSNINGER:
            return åpenBehandling.årsak === BehandlingÅrsak.SØKNAD;
        case Brevmal.VARSEL_OM_REVURDERING:
            return (
                åpenBehandling.type === Behandlingstype.REVURDERING && åpenBehandling.årsak !== BehandlingÅrsak.SØKNAD
            );
        case Brevmal.SVARTIDSBREV:
            return åpenBehandling.årsak === BehandlingÅrsak.SØKNAD;
        case Brevmal.FORLENGET_SVARTIDSBREV:
            return [Behandlingstype.FØRSTEGANGSBEHANDLING, Behandlingstype.REVURDERING].includes(åpenBehandling.type);
        case Brevmal.HENLEGGE_TRUKKET_SØKNAD:
            return false;
        case Brevmal.VARSEL_OM_REVURDERING_FRA_NASJONAL_TIL_EØS:
            return (
                åpenBehandling.type === Behandlingstype.REVURDERING &&
                åpenBehandling.kategori === BehandlingKategori.EØS &&
                [BehandlingÅrsak.NYE_OPPLYSNINGER, BehandlingÅrsak.SØKNAD].includes(åpenBehandling.årsak)
            );
        case Brevmal.INNHENTE_OPPLYSNINGER_ETTER_SØKNAD_I_SED:
            return (
                åpenBehandling.årsak === BehandlingÅrsak.SØKNAD &&
                åpenBehandling.kategori === BehandlingKategori.EØS &&
                [Behandlingstype.FØRSTEGANGSBEHANDLING, Behandlingstype.REVURDERING].includes(åpenBehandling.type)
            );
        case Brevmal.INNHENTE_OPPLYSNINGER_OG_INFORMASJON_OM_AT_ANNEN_FORELDER_MED_SELVSTENDIG_RETT_HAR_SØKT:
            return (
                åpenBehandling.årsak === BehandlingÅrsak.SØKNAD &&
                [Behandlingstype.FØRSTEGANGSBEHANDLING, Behandlingstype.REVURDERING].includes(åpenBehandling.type)
            );
        case Brevmal.VARSEL_ANNEN_FORELDER_MED_SELVSTENDIG_RETT_SØKT:
            return åpenBehandling.type === Behandlingstype.REVURDERING;
        case Brevmal.VARSEL_OM_VEDTAK_ETTER_SØKNAD_I_SED:
            return (
                åpenBehandling.årsak === BehandlingÅrsak.SØKNAD &&
                åpenBehandling.kategori === BehandlingKategori.EØS &&
                [Behandlingstype.FØRSTEGANGSBEHANDLING, Behandlingstype.REVURDERING].includes(åpenBehandling.type)
            );
        case Brevmal.UTBETALING_ETTER_KA_VEDTAK:
            return åpenBehandling.årsak === BehandlingÅrsak.IVERKSETTE_KA_VEDTAK;
    }
};

export const mottakersMålformImplementering = (
    personer: IGrunnlagPerson[],
    skjemaValideringsStatus: Valideringsstatus,
    mottakerIdent: string | readonly string[] | number
) =>
    personer.find((person: IGrunnlagPerson) => {
        if (skjemaValideringsStatus === Valideringsstatus.OK) {
            return person.personIdent === mottakerIdent;
        } else {
            return person.type === PersonType.SØKER;
        }
    })?.målform ?? Målform.NB;

export const useBrevModul = () => {
    const { behandling } = useBehandlingContext();

    const maksAntallKulepunkter = 20;
    const makslengdeFritekstHvertKulepunkt = 220;
    const maksLengdeFritekstAvsnitt = 1000;

    const [visFritekstAvsnittTekstboks, settVisFritekstAvsnittTekstboks] = useState(false);

    const behandlingKategori = behandling.kategori;

    const brevmottakere = behandling.brevmottakere;

    const mottakerIdent = useFelt({
        verdi: '',
        valideringsfunksjon: (felt: FeltState<string>) =>
            felt.verdi.length >= 1 ? ok(felt) : feil(felt, 'Du må velge en mottaker'),
    });
    const brevmal = useFelt({
        verdi: '',
        valideringsfunksjon: (felt: FeltState<Brevmal | ''>) =>
            felt.verdi ? ok(felt) : feil(felt, 'Du må velge en brevmal'),
    });

    const friteksterKulepunkter = useFelt<FeltState<IFritekstFelt>[]>({
        verdi: [],
        valideringsfunksjon: (felt: FeltState<FeltState<IFritekstFelt>[]>) => {
            return felt.verdi.some(
                fritekst => fritekst.valideringsstatus === Valideringsstatus.FEIL || fritekst.verdi.tekst.length === 0
            )
                ? feil(felt, '')
                : ok(felt);
        },
        skalFeltetVises: (avhengigheter: Avhengigheter) => {
            return (
                avhengigheter?.brevmal.valideringsstatus === Valideringsstatus.OK &&
                ![Brevmal.SVARTIDSBREV, Brevmal.UTBETALING_ETTER_KA_VEDTAK].includes(avhengigheter.brevmal.verdi)
            );
        },
        avhengigheter: { brevmal },
    });

    const fritekstAvsnitt = useFelt<string | undefined>({
        verdi: undefined,
        valideringsfunksjon: fritekst => {
            if (fritekst.verdi === undefined) {
                return ok(fritekst);
            }

            if (fritekst.verdi.trim() === '') {
                return feil(fritekst, 'Du må skrive tekst i feltet, eller fjerne det om du ikke skal ha fritekst.');
            }

            if (fritekst.verdi.length > maksLengdeFritekstAvsnitt) {
                return feil(fritekst, `Du har nådd maks antall tegn: ${maksLengdeFritekstAvsnitt}`);
            }

            return ok(fritekst);
        },
        skalFeltetVises: (avhengigheter: Avhengigheter) => {
            return (
                avhengigheter?.brevmal.valideringsstatus === Valideringsstatus.OK &&
                [Brevmal.UTBETALING_ETTER_KA_VEDTAK].includes(avhengigheter.brevmal.verdi)
            );
        },
        avhengigheter: { brevmal },
    });

    const antallUkerSvarfrist = useFelt({
        verdi: behandlingKategori === BehandlingKategori.EØS ? 8 : 3,
        valideringsfunksjon: (felt: FeltState<number>) => {
            if (isNaN(felt.verdi)) {
                return feil(felt, 'Antall uker svarfrist må være et tall');
            }

            // Maksimal saksbehandlingstid er 5 måneder. Svarfristen må derfor være mindre enn dette.
            const maksSvarfristUker = 4 * 5;
            if (felt.verdi > maksSvarfristUker) {
                return feil(
                    felt,
                    `Du kan ikke sette antall uker svartid til mer enn ${maksSvarfristUker} uker (5 måneder)`
                );
            }

            return ok(felt);
        },
        skalFeltetVises: (avhengigheter: Avhengigheter) => {
            return (
                avhengigheter?.brevmal.valideringsstatus === Valideringsstatus.OK &&
                [Brevmal.FORLENGET_SVARTIDSBREV].includes(avhengigheter.brevmal.verdi)
            );
        },
        avhengigheter: { brevmal },
    });

    const dokumenter = useFelt({
        verdi: [],
        valideringsfunksjon: (felt: FeltState<ISelectOptionMedBrevtekst[]>, avhengigheter?: Avhengigheter) => {
            if (felt.verdi.length === 0 && avhengigheter?.fritekster.verdi.length === 0) {
                return feil(felt, `Du må velge minst ett dokument`);
            }

            return ok(felt);
        },
        skalFeltetVises: (avhengigheter: Avhengigheter) => {
            return (
                avhengigheter?.brevmal.valideringsstatus === Valideringsstatus.OK &&
                [
                    Brevmal.INNHENTE_OPPLYSNINGER,
                    Brevmal.INNHENTE_OPPLYSNINGER_ETTER_SØKNAD_I_SED,
                    Brevmal.INNHENTE_OPPLYSNINGER_OG_INFORMASJON_OM_AT_ANNEN_FORELDER_MED_SELVSTENDIG_RETT_HAR_SØKT,
                ].includes(avhengigheter?.brevmal.verdi)
            );
        },
        avhengigheter: { brevmal, fritekster: friteksterKulepunkter },
        nullstillVedAvhengighetEndring: false,
    });

    const barnBrevetGjelder = useFelt<IBarnMedOpplysninger[]>({
        verdi: [],
        valideringsfunksjon: (felt: FeltState<IBarnMedOpplysninger[]>) => {
            return felt.verdi.some((barn: IBarnMedOpplysninger) => barn.merket)
                ? ok(felt)
                : feil(felt, 'Du må velge hvilke barn brevet gjelder');
        },
        skalFeltetVises: (avhengigheter: Avhengigheter) => {
            return [
                Brevmal.INNHENTE_OPPLYSNINGER_ETTER_SØKNAD_I_SED,
                Brevmal.INNHENTE_OPPLYSNINGER_OG_INFORMASJON_OM_AT_ANNEN_FORELDER_MED_SELVSTENDIG_RETT_HAR_SØKT,
                Brevmal.VARSEL_ANNEN_FORELDER_MED_SELVSTENDIG_RETT_SØKT,
                Brevmal.VARSEL_OM_VEDTAK_ETTER_SØKNAD_I_SED,
            ].includes(avhengigheter?.brevmal.verdi);
        },
        avhengigheter: { brevmal },
        nullstillVedAvhengighetEndring: false,
    });

    const { kanSendeSkjema, onSubmit, skjema, settVisfeilmeldinger } = useSkjema<
        {
            mottakerIdent: string;
            brevmal: Brevmal | '';
            dokumenter: ISelectOptionMedBrevtekst[];
            friteksterKulepunkter: FeltState<IFritekstFelt>[];
            fritekstAvsnitt: string | undefined;
            barnBrevetGjelder: IBarnMedOpplysninger[];
            antallUkerSvarfrist: number;
        },
        IBehandling
    >({
        felter: {
            mottakerIdent,
            brevmal,
            dokumenter,
            friteksterKulepunkter,
            fritekstAvsnitt,
            barnBrevetGjelder,
            antallUkerSvarfrist,
        },
        skjemanavn: 'brevmodul',
    });

    const nullstillBarnBrevetGjelder = () => {
        const barn = personer
            .filter(person => person.type === PersonType.BARN)
            .map(
                (person: IGrunnlagPerson): IBarnMedOpplysninger => ({
                    ident: person.personIdent,
                    fødselsdato: person.fødselsdato,
                    navn: person.navn,
                    merket: false,
                    manueltRegistrert: false,
                    erFolkeregistrert: true,
                })
            );
        skjema.felter.barnBrevetGjelder.validerOgSettFelt(barn);
    };

    /**
     * Nullstill enkelte felter i skjemaet ved oppdatering av åpenbehandling i staten.
     * Dette fordi at man kan ha gjort endring på målform
     */
    useEffect(() => {
        skjema.felter.dokumenter.nullstill();
        nullstillBarnBrevetGjelder();
    }, [behandling]);

    useEffect(() => {
        nullstillBarnBrevetGjelder();
    }, [skjema.felter.brevmal.verdi]);

    const personer = behandling.personer;

    const mottakersMålform = (): Målform =>
        mottakersMålformImplementering(
            personer,
            skjema.felter.mottakerIdent.valideringsstatus,
            skjema.felter.mottakerIdent.verdi
        );

    const hentMuligeBrevMaler = (): Brevmal[] => hentMuligeBrevmalerImplementering(behandling);

    const leggTilFritekst = (valideringsmelding?: string) => {
        skjema.felter.friteksterKulepunkter.validerOgSettFelt([
            ...skjema.felter.friteksterKulepunkter.verdi,
            lagInitiellFritekst(
                '',
                genererIdBasertPåAndreFritekster(friteksterKulepunkter),
                makslengdeFritekstHvertKulepunkt,
                valideringsmelding
            ),
        ]);
    };

    const erBrevmalMedObligatoriskFritekst = (brevmal: Brevmal) =>
        [
            Brevmal.VARSEL_OM_REVURDERING,
            Brevmal.VARSEL_OM_REVURDERING_FRA_NASJONAL_TIL_EØS,
            Brevmal.VARSEL_OM_VEDTAK_ETTER_SØKNAD_I_SED,
            Brevmal.VARSEL_ANNEN_FORELDER_MED_SELVSTENDIG_RETT_SØKT,
            Brevmal.FORLENGET_SVARTIDSBREV,
        ].includes(brevmal);

    /**
     * Legger til initielt fritekstpunkt for brevmaler med obligatorisk fritekst
     */
    useEffect(() => {
        if (friteksterKulepunkter.verdi.length === 0 && erBrevmalMedObligatoriskFritekst(brevmal.verdi as Brevmal)) {
            const valideringsmelding = 'Dette kulepunktet er obligatorisk. Du må skrive tekst i feltet.';
            leggTilFritekst(valideringsmelding);
        }
    }, [brevmal, friteksterKulepunkter]);

    const hentSkjemaData = (): IManueltBrevRequestPåBehandling => {
        const multiselectVerdier = [
            ...skjema.felter.dokumenter.verdi.map((selectOption: ISelectOptionMedBrevtekst) => {
                if (selectOption.brevtekst) {
                    return selectOption.brevtekst[mottakersMålform()];
                } else {
                    return selectOption.value;
                }
            }),
            ...skjema.felter.friteksterKulepunkter.verdi.map(f => f.verdi.tekst),
        ];

        const barnBrevetGjelder = skjema.felter.barnBrevetGjelder.verdi.filter(barn => barn.merket);

        return {
            mottakerIdent: skjema.felter.mottakerIdent.verdi,
            multiselectVerdier: multiselectVerdier,
            brevmal: skjema.felter.brevmal.verdi as Brevmal,
            barnIBrev: [],
            barnasFødselsdager: barnBrevetGjelder.map(barn => barn.fødselsdato || ''),
            behandlingKategori,
            antallUkerSvarfrist: skjema.felter.antallUkerSvarfrist.verdi,
            fritekstAvsnitt: skjema.felter.fritekstAvsnitt.verdi,
        };
    };

    return {
        skjema,
        hentMuligeBrevMaler,
        hentSkjemaData,
        kanSendeSkjema,
        mottakersMålform,
        onSubmit,
        personer,
        leggTilFritekst,
        makslengdeFritekstHvertKulepunkt,
        maksAntallKulepunkter,
        maksLengdeFritekstAvsnitt,
        settVisfeilmeldinger,
        erBrevmalMedObligatoriskFritekst,
        brevmottakere,
        visFritekstAvsnittTekstboks,
        settVisFritekstAvsnittTekstboks,
    };
};
