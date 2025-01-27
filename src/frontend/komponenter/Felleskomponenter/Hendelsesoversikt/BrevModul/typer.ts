import type { Målform } from '../../../../typer/søknad';

export interface BrevtypeSelect extends HTMLSelectElement {
    value: Brevmal | '';
}

export enum Brevmal {
    INNHENTE_OPPLYSNINGER = 'INNHENTE_OPPLYSNINGER',
    INNHENTE_OPPLYSNINGER_ETTER_SØKNAD_I_SED = 'INNHENTE_OPPLYSNINGER_ETTER_SØKNAD_I_SED',
    VARSEL_OM_VEDTAK_ETTER_SØKNAD_I_SED = 'VARSEL_OM_VEDTAK_ETTER_SØKNAD_I_SED',
    VARSEL_OM_REVURDERING = 'VARSEL_OM_REVURDERING',
    VARSEL_OM_REVURDERING_FRA_NASJONAL_TIL_EØS = 'VARSEL_OM_REVURDERING_FRA_NASJONAL_TIL_EØS',
    VARSEL_ANNEN_FORELDER_MED_SELVSTENDIG_RETT_SØKT = 'VARSEL_ANNEN_FORELDER_MED_SELVSTENDIG_RETT_SØKT',
    HENLEGGE_TRUKKET_SØKNAD = 'HENLEGGE_TRUKKET_SØKNAD',
    SVARTIDSBREV = 'SVARTIDSBREV',
    FORLENGET_SVARTIDSBREV = 'FORLENGET_SVARTIDSBREV',
    INNHENTE_OPPLYSNINGER_OG_INFORMASJON_OM_AT_ANNEN_FORELDER_MED_SELVSTENDIG_RETT_HAR_SØKT = 'INNHENTE_OPPLYSNINGER_OG_INFORMASJON_OM_AT_ANNEN_FORELDER_MED_SELVSTENDIG_RETT_HAR_SØKT',
    UTBETALING_ETTER_KA_VEDTAK = 'UTBETALING_ETTER_KA_VEDTAK',
}

export enum Informasjonsbrev {
    INFORMASJONSBREV_DELT_BOSTED = 'INFORMASJONSBREV_DELT_BOSTED',
    INFORMASJONSBREV_FØDSEL_MINDREÅRIG = 'INFORMASJONSBREV_FØDSEL_MINDREÅRIG',
    INFORMASJONSBREV_FØDSEL_UMYNDIG = 'INFORMASJONSBREV_FØDSEL_UMYNDIG',
    INFORMASJONSBREV_KAN_SØKE = 'INFORMASJONSBREV_KAN_SØKE',
    INFORMASJONSBREV_KAN_SØKE_EØS = 'INFORMASJONSBREV_KAN_SØKE_EØS',
    INFORMASJONSBREV_FØDSEL_GENERELL = 'INFORMASJONSBREV_FØDSEL_GENERELL',
    INFORMASJONSBREV_TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HAR_FÅTT_EN_SØKNAD_FRA_ANNEN_FORELDER = 'INFORMASJONSBREV_TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HAR_FÅTT_EN_SØKNAD_FRA_ANNEN_FORELDER',
    INFORMASJONSBREV_TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_VARSEL_OM_REVURDERING = 'INFORMASJONSBREV_TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_VARSEL_OM_REVURDERING',
    INFORMASJONSBREV_TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HENTER_IKKE_REGISTEROPPLYSNINGER = 'INFORMASJONSBREV_TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HENTER_IKKE_REGISTEROPPLYSNINGER',
}

export const brevmaler: Record<Brevmal, string> = {
    INNHENTE_OPPLYSNINGER: 'Innhent opplysninger',
    INNHENTE_OPPLYSNINGER_ETTER_SØKNAD_I_SED: 'Innhente opplysninger etter søknad i SED',
    INNHENTE_OPPLYSNINGER_OG_INFORMASJON_OM_AT_ANNEN_FORELDER_MED_SELVSTENDIG_RETT_HAR_SØKT:
        'Innhente opplysninger og informasjon om at annen forelder med selvstendig rett har søkt',
    VARSEL_OM_VEDTAK_ETTER_SØKNAD_I_SED: 'Varsel om vedtak etter søknad i SED',
    VARSEL_OM_REVURDERING: 'Varsel om revurdering',
    HENLEGGE_TRUKKET_SØKNAD: 'Henlegg søknad',
    SVARTIDSBREV: 'Svartidsbrev',
    VARSEL_OM_REVURDERING_FRA_NASJONAL_TIL_EØS: 'Varsel om revurdering fra nasjonal til EØS',
    VARSEL_ANNEN_FORELDER_MED_SELVSTENDIG_RETT_SØKT:
        'Varsel annen forelder med selvstendig rett søkt',
    FORLENGET_SVARTIDSBREV: 'Forlenget svartidsbrev',
    UTBETALING_ETTER_KA_VEDTAK: 'Utbetaling etter KA-vedtak',
};

export const leggTilValuePåOption = (
    option: Omit<ISelectOptionMedBrevtekst, 'value'>
): ISelectOptionMedBrevtekst => ({
    ...option,
    value: option.label.toLocaleLowerCase().replace(' ', '_'),
});

type OptionType = {
    value: string;
    label: string;
};

export interface ISelectOptionMedBrevtekst extends OptionType {
    value: string;
    label: string;
    brevtekst?: Record<Målform, string>;
}

export const opplysningsdokumenter: Omit<ISelectOptionMedBrevtekst, 'value'>[] = [
    {
        label: 'Barnehageplass - barnet',
        brevtekst: {
            NB: 'Dokumentasjon fra kommunen som viser fra hvilken dato barnet har fått tildelt barnehageplass og hvor mange timer i uken barnet har fått tildelt.',
            NN: 'Dokumentasjon frå kommunen som viser kva dato barnet har fått tildelt barnehageplass frå og antal timar i veka barnet har fått tildelt.',
        },
    },
    {
        label: 'Barnehageplass - barna',
        brevtekst: {
            NB: 'Dokumentasjon fra kommunen som viser fra hvilken dato barna har fått tildelt barnehageplass og hvor mange timer i uken barna har fått tildelt.',
            NN: 'Dokumentasjon frå kommunen som viser kva dato barna har fått tildelt barnehageplass frå og antal timar i veka barna har fått tildelt.',
        },
    },
    {
        label: 'Medlemskap - søker',
        brevtekst: {
            NB: 'Dokumentasjon som viser at du har vært medlem i folketrygden eller i trygdeordninger i andre EØS-land i 5 år. Dokumentasjonen må også vise periodene du har vært medlem.',
            NN: 'Dokumentasjon som viser at du har vore medlem i folketrygda eller i trygdeordningar i andre EØS-land i 5 år. Dokumentasjonen må også vise periodane du har vore medlem.',
        },
    },
    {
        label: 'Medlemskap - den andre forelderen',
        brevtekst: {
            NB: 'Dokumentasjon som viser at den andre forelderen har vært medlem i folketrygden eller i trygdeordninger i andre EØS-land i 5 år. Dokumentasjonen må også vise hvilke perioder den andre forelderen har vært medlem.',
            NN: 'Dokumentasjon som viser at den andre forelderen har vore medlem i folketrygda eller i trygdeordningar i andre EØS-land i 5 år. Dokumentasjonen må også vise kva periodar den andre forelderen har vore medlem.',
        },
    },
    {
        label: 'Medlemskap - søker og den andre forelderen',
        brevtekst: {
            NB: 'Dokumentasjon som viser at du og den andre forelderen har vært medlem i folketrygden eller i trygdeordninger i andre EØS-land i 5 år. Dokumentasjonen må også vise hvilke perioder du og den andre forelderen har vært medlem.',
            NN: 'Dokumentasjon som viser at du og den andre forelderen har vore medlem i folketrygda eller i trygdeordningar i andre EØS-land i 5 år. Dokumentasjonen må også vise kva periodar du og den andre forelderen har vore medlem.',
        },
    },
    {
        label: 'Avtale om delt bosted',
        brevtekst: {
            NB: 'Avtale om delt bosted',
            NN: 'Avtale om delt bustad',
        },
    },
    {
        label: 'Enighet om deling',
        brevtekst: {
            NB: 'Dokumentasjon som viser at du og den andre forelderen er enige om å dele kontantstøtten.',
            NN: 'Dokumentasjon som viser at du og den andre forelderen er einige om å dele kontantstøtta.',
        },
    },
    {
        label: 'Avtale om fast bosted',
        brevtekst: {
            NB: 'Avtale om fast bosted',
            NN: 'Avtale om fast bustad',
        },
    },
    {
        label: 'Bor sammen med - barnet',
        brevtekst: {
            NB: 'Dokumentasjon som viser at barnet bor sammen med deg.',
            NN: 'Dokumentasjon som viser at barnet bur saman med deg.',
        },
    },
    {
        label: 'Bor sammen med - barna',
        brevtekst: {
            NB: 'Dokumentasjon som viser at barna bor sammen med deg.',
            NN: 'Dokumentasjon som viser at barna bur saman med deg.',
        },
    },
    {
        label: 'Flyttet til søker - barnet',
        brevtekst: {
            NB: 'Dokumentasjon som viser hvilken dato barnet flyttet til deg. Du må melde flytting til Folkeregisteret.',
            NN: 'Dokumentasjon som viser frå kva dato barnet flyttet til deg. Du må melde flytting til Folkeregisteret.',
        },
    },
    {
        label: 'Flyttet til søker - barna',
        brevtekst: {
            NB: 'Dokumentasjon som viser hvilken dato barna flyttet til deg. Du må melde flytting til Folkeregisteret.',
            NN: 'Dokumentasjon som viser frå kva dato barna flytta til deg. Du må melde flytting til Folkeregisteret.',
        },
    },
    {
        label: 'Rettsavgjørelse - barnet',
        brevtekst: {
            NB: 'Rettsavgjørelse som viser fra hvilken dato barnet bor sammen med deg.',
            NN: 'Avgjersle frå retten som viser frå kva dato barnet bur saman med deg.',
        },
    },
    {
        label: 'Rettsavgjørelse - barna',
        brevtekst: {
            NB: 'Rettsavgjørelse som viser fra hvilken dato barna bor sammen med deg.',
            NN: 'Avgjersle frå retten som viser frå kva dato barna bur saman med deg.',
        },
    },
    {
        label: 'Vergefullmakt',
        brevtekst: {
            NB: 'Vergefullmakt',
            NN: 'Vergefullmakt',
        },
    },
    {
        label: 'Utenlandsopphold, periode - søker og barnet',
        brevtekst: {
            NB: 'Dokumentasjon som viser hvilken periode du og barnet har vært i utlandet. For eksempel kopi av flybilletter, kopi av pass med stempel, bekreftelse fra barnehage eller helsestasjon.',
            NN: 'Dokumentasjon som viser kva for periode du og barna har vore i utlandet. Til dømes kopi av flybillettar, kopi av pass med stempel, stadfesting frå barnehage eller helsestasjon.',
        },
    },
    {
        label: 'Utenlandsopphold, periode - søker og barna',
        brevtekst: {
            NB: 'Dokumentasjon som viser hvilken periode du og barna har vært i utlandet. For eksempel kopi av flybilletter, kopi av pass med stempel, bekreftelse barnehage eller helsestasjon.',
            NN: 'Dokumentasjon som viser kva for periode du og barna har vore i utlandet. Til dømes kopi av flybillettar, kopi av pass med stempel, stadfesting frå barnehage eller helsestasjon.',
        },
    },
    {
        label: 'Utenlandsopphold, periode - barnet',
        brevtekst: {
            NB: 'Dokumentasjon som viser hvilken periode barnet har vært i utlandet. For eksempel kopi av flybilletter, kopi av pass med stempel, bekreftelse fra barnehage eller helsestasjon.',
            NN: 'Dokumentasjon som viser kva for periode barnet har vore i utlandet. Til dømes kopi av flybillettar, kopi av pass med stempel, stadfesting frå barnehage eller helsestasjon.',
        },
    },
    {
        label: 'Utenlandsopphold, periode - barna',
        brevtekst: {
            NB: 'Dokumentasjon som viser hvilken periode barna har vært i utlandet. For eksempel kopi av flybilletter, kopi av pass med stempel, bekreftelse fra barnehage eller helsestasjon.',
            NN: 'Dokumentasjon som viser kva for periode barna har vore i utlandet. Til dømes kopi av flybillettar, kopi av pass med stempel, stadfesting frå barnehage eller helsestasjon.',
        },
    },
    {
        label: 'Ankomst Norge - barnet',
        brevtekst: {
            NB: 'Dokumentasjon som viser når barnet kom til Norge.',
            NN: 'Dokumentasjon som viser når barnet kom til Noreg.',
        },
    },
    {
        label: 'Ankomst Norge - barna',
        brevtekst: {
            NB: 'Dokumentasjon som viser når barna kom til Norge.',
            NN: 'Dokumentasjon som viser når barna kom til Noreg',
        },
    },
    {
        label: 'Ankomst Norge - søker',
        brevtekst: {
            NB: 'Dokumentasjon som viser når du kom til Norge.',
            NN: 'Dokumentasjon som viser når du kom til Noreg.',
        },
    },
    {
        label: 'Ankomst Norge - søker og barnet',
        brevtekst: {
            NB: 'Dokumentasjon som viser når du og barnet kom til Norge.',
            NN: 'Dokumentasjon som viser når du og barnet kom til Noreg.',
        },
    },
    {
        label: 'Ankomst Norge - søker og barna',
        brevtekst: {
            NB: 'Dokumentasjon som viser når du og barna kom til Norge.',
            NN: 'Dokumentasjon som viser når du og barna kom til Noreg.',
        },
    },
    {
        label: 'Oppholdstillatelse - barnet',
        brevtekst: {
            NB: 'Kopi av vedtak om oppholdstillatelse for barnet',
            NN: 'Kopi av vedtak om opphaldsløyve for barnet.',
        },
    },
    {
        label: 'Oppholdstillatelse - barna',
        brevtekst: {
            NB: 'Kopi av vedtak om oppholdstillatelse for barna.',
            NN: 'Kopi av vedtak om opphaldsløyve for barna.',
        },
    },
    {
        label: 'Oppholdstillatelse - søker',
        brevtekst: {
            NB: 'Kopi av vedtak om oppholdstillatelse for deg.',
            NN: 'Kopi av vedtak om opphaldsløyve for deg.',
        },
    },
    {
        label: 'Oppholdstillatelse - søker og barnet',
        brevtekst: {
            NB: 'Kopi av vedtak om oppholdstillatelse for deg og barnet.',
            NN: 'Kopi av vedtak om opphaldsløyve for deg og barnet.',
        },
    },
    {
        label: 'Oppholdstillatelse - søker og barna',
        brevtekst: {
            NB: 'Kopi av vedtak om oppholdstillatelse for deg og barna.',
            NN: 'Kopi av vedtak om opphaldsløyve for deg og barna.',
        },
    },
];
