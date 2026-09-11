import { useEffect, useState } from 'react';

import { useSendBehandlingBrev } from '@hooks/useSendBehandlingBrev';
import { useBehandlingContext } from '@sider/Fagsak/Behandling/context/BehandlingContext';
import { Behandlingstype, BehandlingÅrsak, type IBehandling } from '@typer/behandling';
import { BehandlingKategori } from '@typer/behandlingstema';
import type { IManueltBrevRequestPåBehandling } from '@typer/dokument';
import type { IGrunnlagPerson } from '@typer/person';
import { PersonType } from '@typer/person';
import type { IBarnMedOpplysninger } from '@typer/søknad';
import { Målform } from '@typer/søknad';
import type { IFritekstFelt } from '@utils/fritekstfelter';
import { genererIdBasertPåAndreFritekstKulepunkter, lagInitiellFritekst } from '@utils/fritekstfelter';
import { useForm } from 'react-hook-form';

import { Valideringsstatus } from '@navikt/familie-skjema';
import { byggSuksessRessurs } from '@navikt/familie-typer';

import { erBrevmalMedObligatoriskFritekstKulepunkt } from './brevmalRegler';
import type { ISelectOptionMedBrevtekst } from './typer';
import { Brevmal } from './typer';

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

export enum BrevmodulFeltnavn {
    MOTTAKER_IDENT = 'mottakerIdent',
    BREVMAL = 'brevmal',
    DOKUMENTER = 'dokumenter',
    FRITEKST_KULEPUNKTER = 'fritekstKulepunkter',
    FRITEKST_AVSNITT = 'fritekstAvsnitt',
    BARN_BREVET_GJELDER = 'barnBrevetGjelder',
    ANTALL_UKER_SVARFRIST = 'antallUkerSvarfrist',
    MOTTAKERLAND_SED = 'mottakerlandSed',
}

export interface BrevModulFormValues {
    [BrevmodulFeltnavn.MOTTAKER_IDENT]: string;
    [BrevmodulFeltnavn.BREVMAL]: Brevmal | '';
    [BrevmodulFeltnavn.DOKUMENTER]: ISelectOptionMedBrevtekst[];
    [BrevmodulFeltnavn.FRITEKST_KULEPUNKTER]: IFritekstFelt[];
    [BrevmodulFeltnavn.FRITEKST_AVSNITT]: string | undefined;
    [BrevmodulFeltnavn.BARN_BREVET_GJELDER]: IBarnMedOpplysninger[];
    [BrevmodulFeltnavn.ANTALL_UKER_SVARFRIST]: number | '';
    [BrevmodulFeltnavn.MOTTAKERLAND_SED]: string[];
}

interface Props {
    onSubmitSuccess: () => void;
}

export const useBrevModul = ({ onSubmitSuccess }: Props) => {
    const { behandling, settÅpenBehandling } = useBehandlingContext();

    const [visFritekstAvsnittTekstboks, settVisFritekstAvsnittTekstboks] = useState(false);

    const behandlingKategori = behandling.kategori;
    const brevmottakere = behandling.brevmottakere;
    const personer = behandling.personer;

    const hentBarnBrevetGjelder = (): IBarnMedOpplysninger[] =>
        personer
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

    const form = useForm<BrevModulFormValues>({
        defaultValues: {
            [BrevmodulFeltnavn.MOTTAKER_IDENT]: '',
            [BrevmodulFeltnavn.BREVMAL]: '',
            [BrevmodulFeltnavn.DOKUMENTER]: [],
            [BrevmodulFeltnavn.FRITEKST_KULEPUNKTER]: [],
            [BrevmodulFeltnavn.FRITEKST_AVSNITT]: undefined,
            [BrevmodulFeltnavn.BARN_BREVET_GJELDER]: [],
            [BrevmodulFeltnavn.ANTALL_UKER_SVARFRIST]: behandlingKategori === BehandlingKategori.EØS ? 8 : 3,
            [BrevmodulFeltnavn.MOTTAKERLAND_SED]: [],
        },
    });

    const { setValue, getValues, setError, reset } = form;

    /**
     * Nullstill enkelte felter i skjemaet ved oppdatering av åpenbehandling i staten.
     * Dette fordi at man kan ha gjort endring på målform
     */
    useEffect(() => {
        setValue(BrevmodulFeltnavn.DOKUMENTER, []);
        setValue(BrevmodulFeltnavn.MOTTAKERLAND_SED, []);
        setValue(BrevmodulFeltnavn.BARN_BREVET_GJELDER, hentBarnBrevetGjelder());
    }, [behandling]);

    const leggTilFritekstKulepunkt = (valideringsmelding?: string) => {
        const fritekstKulepunkter = getValues(BrevmodulFeltnavn.FRITEKST_KULEPUNKTER);
        setValue(BrevmodulFeltnavn.FRITEKST_KULEPUNKTER, [
            ...fritekstKulepunkter,
            lagInitiellFritekst('', genererIdBasertPåAndreFritekstKulepunkter(fritekstKulepunkter), valideringsmelding),
        ]);
    };

    /**
     * Nullstiller relevante felter når brevmal endres, og legger til et initielt obligatorisk
     * fritekstpunkt for brevmaler som krever det. Vi bruker reset (fremfor setValue) slik at
     * innsendt-tilstanden og eventuelle valideringsfeil også nullstilles. Ellers ville feilmeldinger
     * fra en tidligere innsending/forhåndsvisning blitt vist umiddelbart på de tomme feltene i den nye brevmalen.
     */
    const onEndreBrevmal = (nyBrevmal: Brevmal | '') => {
        reset({
            ...getValues(),
            [BrevmodulFeltnavn.BREVMAL]: nyBrevmal,
            [BrevmodulFeltnavn.DOKUMENTER]: [],
            [BrevmodulFeltnavn.FRITEKST_KULEPUNKTER]: [],
            [BrevmodulFeltnavn.FRITEKST_AVSNITT]: undefined,
            [BrevmodulFeltnavn.ANTALL_UKER_SVARFRIST]: behandlingKategori === BehandlingKategori.EØS ? 8 : 3,
            [BrevmodulFeltnavn.MOTTAKERLAND_SED]: [],
            [BrevmodulFeltnavn.BARN_BREVET_GJELDER]: hentBarnBrevetGjelder(),
        });

        if (nyBrevmal !== '' && erBrevmalMedObligatoriskFritekstKulepunkt(nyBrevmal)) {
            leggTilFritekstKulepunkt('Dette kulepunktet er obligatorisk. Du må skrive tekst i feltet.');
        }
    };

    const mottakersMålform = (mottakerIdent: string): Målform =>
        mottakersMålformImplementering(
            personer,
            mottakerIdent.length >= 1 ? Valideringsstatus.OK : Valideringsstatus.IKKE_VALIDERT,
            mottakerIdent
        );

    const hentMuligeBrevMaler = (): Brevmal[] => hentMuligeBrevmalerImplementering(behandling);

    const hentSkjemaData = (values: BrevModulFormValues): IManueltBrevRequestPåBehandling => {
        const multiselectVerdier = [
            ...values.dokumenter.map((selectOption: ISelectOptionMedBrevtekst) => {
                if (selectOption.brevtekst) {
                    return selectOption.brevtekst[mottakersMålform(values.mottakerIdent)];
                } else {
                    return selectOption.value;
                }
            }),
            ...values.fritekstKulepunkter.map(fritekst => fritekst.tekst),
        ];

        const barnBrevetGjelder = values.barnBrevetGjelder.filter(barn => barn.merket);

        return {
            mottakerIdent: values.mottakerIdent,
            multiselectVerdier: multiselectVerdier,
            brevmal: values.brevmal as Brevmal,
            barnIBrev: [],
            barnasFødselsdager: barnBrevetGjelder.map(barn => barn.fødselsdato || ''),
            behandlingKategori,
            antallUkerSvarfrist: Number(values.antallUkerSvarfrist),
            fritekstAvsnitt: values.fritekstAvsnitt,
            mottakerlandSed: values.mottakerlandSed,
        };
    };

    const { mutateAsync: sendBrev } = useSendBehandlingBrev(behandling.behandlingId);

    const onSubmit = async (values: BrevModulFormValues) => {
        try {
            const oppdatertBehandling = await sendBrev(hentSkjemaData(values));
            onSubmitSuccess();
            settÅpenBehandling(byggSuksessRessurs(oppdatertBehandling));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'En ukjent feil oppstod.';
            setError('root', { message });
        }
    };

    return {
        form,
        onSubmit,
        hentSkjemaData,
        hentMuligeBrevMaler,
        onEndreBrevmal,
        mottakersMålform,
        leggTilFritekstKulepunkt,
        personer,
        brevmottakere,
        visFritekstAvsnittTekstboks,
        settVisFritekstAvsnittTekstboks,
    };
};
