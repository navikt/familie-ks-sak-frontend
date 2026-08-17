import type { SkjemaBrevmottaker } from '@komponenter/Saklinje/Meny/LeggTilEllerFjernBrevmottakere/useBrevmottakerSkjema';
import type { IManueltBrevRequestPåFagsak } from '@typer/dokument';
import type { IPersonInfo } from '@typer/person';
import { Datoformat, isoStringTilFormatertString } from '@utils/dato';

import type { DokumentutsendingFormValues } from './useDokumentutsendingSkjema';
import { Informasjonsbrev } from '../../Behandling/Høyremeny/Brev/typer';
import { DokumentÅrsak } from '../dokumentÅrsakTyper';

interface SkjemaDataInput {
    skjemaverdier: DokumentutsendingFormValues;
    bruker: IPersonInfo;
    manuelleBrevmottakerePåFagsak: SkjemaBrevmottaker[];
}

const hentEnkeltInformasjonsbrevRequest = ({
    skjemaverdier,
    bruker,
    manuelleBrevmottakerePåFagsak,
    brevmal,
}: SkjemaDataInput & {
    brevmal: Informasjonsbrev;
}): IManueltBrevRequestPåFagsak => ({
    mottakerIdent: bruker.personIdent,
    mottakerNavn: bruker.navn,
    mottakerMålform: skjemaverdier.målform,
    multiselectVerdier: [],
    barnIBrev: [],
    brevmal: brevmal,
    manuelleBrevmottakere: manuelleBrevmottakerePåFagsak,
});

const hentBarnIBrevSkjemaData = ({
    skjemaverdier,
    bruker,
    manuelleBrevmottakerePåFagsak,
    brevmal,
}: SkjemaDataInput & {
    brevmal: Informasjonsbrev;
}): IManueltBrevRequestPåFagsak => {
    const merkedeBarn = skjemaverdier.valgteBarn.filter(barn => barn.merket);

    return {
        mottakerIdent: bruker.personIdent,
        mottakerNavn: bruker.navn,
        mottakerMålform: skjemaverdier.målform,
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
        manuelleBrevmottakere: manuelleBrevmottakerePåFagsak,
    };
};

const hentInnhenteOpplysningerKlageSkjemaData = ({
    skjemaverdier,
    bruker,
    manuelleBrevmottakerePåFagsak,
}: SkjemaDataInput): IManueltBrevRequestPåFagsak => ({
    mottakerIdent: bruker.personIdent,
    mottakerNavn: bruker.navn,
    mottakerMålform: skjemaverdier.målform,
    multiselectVerdier: [],
    barnIBrev: [],
    brevmal: Informasjonsbrev.INFORMASJONSBREV_INNHENTE_OPPLYSNINGER_KLAGE,
    manuelleBrevmottakere: manuelleBrevmottakerePåFagsak,
    fritekstAvsnitt: skjemaverdier.fritekstAvsnitt,
});

export const transformerSkjemaData = ({
    skjemaverdier,
    bruker,
    manuelleBrevmottakerePåFagsak,
}: SkjemaDataInput): IManueltBrevRequestPåFagsak => {
    if (!skjemaverdier.årsak) {
        throw new Error('Årsak er ikke valgt og vi kan ikke sende inn skjema');
    }

    switch (skjemaverdier.årsak) {
        case DokumentÅrsak.KAN_SØKE_EØS:
            return hentEnkeltInformasjonsbrevRequest({
                skjemaverdier,
                bruker,
                manuelleBrevmottakerePåFagsak,
                brevmal: Informasjonsbrev.INFORMASJONSBREV_KAN_SØKE_EØS,
            });

        case DokumentÅrsak.TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_VARSEL_OM_REVURDERING:
            return hentBarnIBrevSkjemaData({
                skjemaverdier,
                bruker,
                manuelleBrevmottakerePåFagsak,
                brevmal: Informasjonsbrev.INFORMASJONSBREV_TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_VARSEL_OM_REVURDERING,
            });

        case DokumentÅrsak.TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HAR_FÅTT_EN_SØKNAD_FRA_ANNEN_FORELDER:
            return hentBarnIBrevSkjemaData({
                skjemaverdier,
                bruker,
                manuelleBrevmottakerePåFagsak,
                brevmal:
                    Informasjonsbrev.INFORMASJONSBREV_TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HAR_FÅTT_EN_SØKNAD_FRA_ANNEN_FORELDER,
            });

        case DokumentÅrsak.TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HENTER_IKKE_REGISTEROPPLYSNINGER:
            return hentBarnIBrevSkjemaData({
                skjemaverdier,
                bruker,
                manuelleBrevmottakerePåFagsak,
                brevmal:
                    Informasjonsbrev.INFORMASJONSBREV_TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HENTER_IKKE_REGISTEROPPLYSNINGER,
            });

        case DokumentÅrsak.KAN_HA_RETT_TIL_PENGESTØTTE_FRA_NAV:
            return hentBarnIBrevSkjemaData({
                skjemaverdier,
                bruker,
                manuelleBrevmottakerePåFagsak,
                brevmal: Informasjonsbrev.INFORMASJONSBREV_KAN_HA_RETT_TIL_PENGESTØTTE_FRA_NAV,
            });

        case DokumentÅrsak.INNHENTE_OPPLYSNINGER_KLAGE:
            return hentInnhenteOpplysningerKlageSkjemaData({ skjemaverdier, bruker, manuelleBrevmottakerePåFagsak });
    }
};
