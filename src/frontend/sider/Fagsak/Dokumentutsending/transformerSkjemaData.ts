import type { SkjemaBrevmottaker } from '@komponenter/Saklinje/Meny/LeggTilEllerFjernBrevmottakere/useBrevmottakerSkjema';
import { finnBarnIBrevÅrsak } from '@sider/Fagsak/Dokumentutsending/barnIBrevÅrsak';
import type { IManueltBrevRequestPåFagsak } from '@typer/dokument';
import type { IPersonInfo } from '@typer/person';
import { Datoformat, isoStringTilFormatertString } from '@utils/dato';

import { DokumentÅrsak } from './dokumentÅrsakTyper';
import type { DokumentutsendingFormValues } from './useDokumentutsendingSkjema';
import { Informasjonsbrev } from '../Behandling/Høyremeny/Brev/typer';

interface TransformerSkjemaDataInput {
    skjemaverdier: DokumentutsendingFormValues;
    bruker: IPersonInfo;
    manuelleBrevmottakerePåFagsak: SkjemaBrevmottaker[];
}

interface SkjemaDataInput extends TransformerSkjemaDataInput {
    brevmal: Informasjonsbrev;
}

type FellesBrevfelter = Pick<
    IManueltBrevRequestPåFagsak,
    'mottakerIdent' | 'mottakerNavn' | 'mottakerMålform' | 'manuelleBrevmottakere'
>;

const brevmalPerÅrsak: Record<DokumentÅrsak, Informasjonsbrev> = {
    [DokumentÅrsak.KAN_SØKE_EØS]: Informasjonsbrev.INFORMASJONSBREV_KAN_SØKE_EØS,
    [DokumentÅrsak.TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HAR_FÅTT_EN_SØKNAD_FRA_ANNEN_FORELDER]:
        Informasjonsbrev.INFORMASJONSBREV_TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HAR_FÅTT_EN_SØKNAD_FRA_ANNEN_FORELDER,
    [DokumentÅrsak.TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_VARSEL_OM_REVURDERING]:
        Informasjonsbrev.INFORMASJONSBREV_TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_VARSEL_OM_REVURDERING,
    [DokumentÅrsak.TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HENTER_IKKE_REGISTEROPPLYSNINGER]:
        Informasjonsbrev.INFORMASJONSBREV_TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HENTER_IKKE_REGISTEROPPLYSNINGER,
    [DokumentÅrsak.KAN_HA_RETT_TIL_PENGESTØTTE_FRA_NAV]:
        Informasjonsbrev.INFORMASJONSBREV_KAN_HA_RETT_TIL_PENGESTØTTE_FRA_NAV,
    [DokumentÅrsak.INNHENTE_OPPLYSNINGER_KLAGE]: Informasjonsbrev.INFORMASJONSBREV_INNHENTE_OPPLYSNINGER_KLAGE,
};

const hentFellesBrevfelter = ({
    skjemaverdier,
    bruker,
    manuelleBrevmottakerePåFagsak,
}: TransformerSkjemaDataInput): FellesBrevfelter => ({
    mottakerIdent: bruker.personIdent,
    mottakerNavn: bruker.navn,
    mottakerMålform: skjemaverdier.målform,
    manuelleBrevmottakere: manuelleBrevmottakerePåFagsak,
});

const hentEnkeltInformasjonsbrevRequest = ({ brevmal, ...input }: SkjemaDataInput): IManueltBrevRequestPåFagsak => ({
    ...hentFellesBrevfelter(input),
    multiselectVerdier: [],
    barnIBrev: [],
    brevmal: brevmal,
});

const hentBarnIBrevSkjemaData = ({ brevmal, ...input }: SkjemaDataInput): IManueltBrevRequestPåFagsak => {
    const { skjemaverdier } = input;
    const merkedeBarn = skjemaverdier.valgteBarn.filter(barn => barn.merket);

    return {
        ...hentFellesBrevfelter(input),
        multiselectVerdier: merkedeBarn.map(
            barn =>
                `Barn født ${isoStringTilFormatertString({
                    isoString: barn.fødselsdato,
                    tilFormat: Datoformat.DATO,
                })}.`
        ),
        barnIBrev: merkedeBarn
            .map(barn => barn.ident)
            .filter((ident): ident is string => ident !== undefined && ident !== null),
        brevmal: brevmal,
    };
};

const hentInnhenteOpplysningerKlageSkjemaData = ({
    brevmal,
    ...input
}: SkjemaDataInput): IManueltBrevRequestPåFagsak => ({
    ...hentFellesBrevfelter(input),
    multiselectVerdier: [],
    barnIBrev: [],
    brevmal,
    fritekstAvsnitt: input.skjemaverdier.fritekstAvsnitt,
});

export const transformerSkjemaData = ({
    skjemaverdier,
    bruker,
    manuelleBrevmottakerePåFagsak,
}: TransformerSkjemaDataInput): IManueltBrevRequestPåFagsak => {
    const { årsak } = skjemaverdier;
    if (!årsak) {
        throw new Error('Årsak er ikke valgt og vi kan ikke sende inn skjema');
    }

    const brevmal = brevmalPerÅrsak[årsak];
    if (!brevmal) {
        throw new Error(`Fant ingen brevmal for årsak ${årsak}`);
    }

    const input = {
        skjemaverdier,
        bruker,
        manuelleBrevmottakerePåFagsak,
        brevmal,
    };

    if (årsak === DokumentÅrsak.INNHENTE_OPPLYSNINGER_KLAGE) {
        return hentInnhenteOpplysningerKlageSkjemaData(input);
    }

    if (finnBarnIBrevÅrsak(årsak) !== undefined) {
        return hentBarnIBrevSkjemaData(input);
    }

    return hentEnkeltInformasjonsbrevRequest(input);
};
