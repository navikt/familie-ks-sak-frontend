import { lagBrevmottaker } from '@testutils/testdata/brevmottakerTestdata';
import { lagPerson } from '@testutils/testdata/personTestdata';
import { Målform } from '@typer/søknad';
import { describe, expect, test } from 'vitest';

import { DokumentÅrsak } from './dokumentÅrsakTyper';
import { transformerSkjemaData } from './transformerSkjemaData';
import type { DokumentutsendingFormValues } from './useDokumentutsendingSkjema';
import { Informasjonsbrev } from '../Behandling/Høyremeny/Brev/typer';

const bruker = lagPerson({ personIdent: '12345678903', navn: 'Test Testersen' });

const barn1 = {
    ident: '01011012345',
    navn: 'Eldst Barnesen',
    fødselsdato: '2010-01-01',
    merket: true,
    manueltRegistrert: false,
    erFolkeregistrert: true,
};

const barn2 = {
    ident: '01011512345',
    navn: 'Yngst Barnesen',
    fødselsdato: '2015-01-01',
    merket: false,
    manueltRegistrert: false,
    erFolkeregistrert: true,
};

const standardSkjemaverdier: DokumentutsendingFormValues = {
    årsak: '',
    målform: Målform.NB,
    fritekstAvsnitt: '',
    valgteBarn: [],
};

const manuelleBrevmottakerePåFagsak = [lagBrevmottaker()];

const barnIBrevÅrsaker = [
    [
        DokumentÅrsak.TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HAR_FÅTT_EN_SØKNAD_FRA_ANNEN_FORELDER,
        Informasjonsbrev.INFORMASJONSBREV_TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HAR_FÅTT_EN_SØKNAD_FRA_ANNEN_FORELDER,
    ],
    [
        DokumentÅrsak.TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_VARSEL_OM_REVURDERING,
        Informasjonsbrev.INFORMASJONSBREV_TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_VARSEL_OM_REVURDERING,
    ],
    [
        DokumentÅrsak.TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HENTER_IKKE_REGISTEROPPLYSNINGER,
        Informasjonsbrev.INFORMASJONSBREV_TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HENTER_IKKE_REGISTEROPPLYSNINGER,
    ],
    [
        DokumentÅrsak.KAN_HA_RETT_TIL_PENGESTØTTE_FRA_NAV,
        Informasjonsbrev.INFORMASJONSBREV_KAN_HA_RETT_TIL_PENGESTØTTE_FRA_NAV,
    ],
] as const;

const enkeltbrevÅrsaker = [[DokumentÅrsak.KAN_SØKE_EØS, Informasjonsbrev.INFORMASJONSBREV_KAN_SØKE_EØS]] as const;

const klageÅrsaker = [
    [DokumentÅrsak.INNHENTE_OPPLYSNINGER_KLAGE, Informasjonsbrev.INFORMASJONSBREV_INNHENTE_OPPLYSNINGER_KLAGE],
] as const;

describe('transformerSkjemaData', () => {
    test('kaster feil dersom årsak ikke er valgt', () => {
        expect(() =>
            transformerSkjemaData({
                skjemaverdier: standardSkjemaverdier,
                bruker,
                manuelleBrevmottakerePåFagsak: [],
            })
        ).toThrow('Årsak er ikke valgt og vi kan ikke sende inn skjema');
    });

    test.each(enkeltbrevÅrsaker)('%s gir enkelt informasjonsbrev uten barn', (årsak, brevmal) => {
        const request = transformerSkjemaData({
            skjemaverdier: {
                ...standardSkjemaverdier,
                årsak,
                valgteBarn: [barn1, barn2],
            },
            bruker,
            manuelleBrevmottakerePåFagsak,
        });

        expect(request).toEqual({
            mottakerIdent: bruker.personIdent,
            mottakerNavn: bruker.navn,
            mottakerMålform: Målform.NB,
            multiselectVerdier: [],
            barnIBrev: [],
            brevmal,
            manuelleBrevmottakere: manuelleBrevmottakerePåFagsak,
        });
    });

    test.each(barnIBrevÅrsaker)('%s gir riktig brevmal og tar med kun merkede barn', (årsak, brevmal) => {
        const request = transformerSkjemaData({
            skjemaverdier: {
                ...standardSkjemaverdier,
                årsak,
                valgteBarn: [barn1, barn2],
            },
            bruker,
            manuelleBrevmottakerePåFagsak,
        });

        expect(request).toEqual({
            mottakerIdent: bruker.personIdent,
            mottakerNavn: bruker.navn,
            mottakerMålform: Målform.NB,
            multiselectVerdier: ['Barn født 01.01.2010.'],
            barnIBrev: [barn1.ident],
            brevmal,
            manuelleBrevmottakere: manuelleBrevmottakerePåFagsak,
        });
    });

    test.each(klageÅrsaker)('%s tar med fritekstAvsnitt og ingen barn', (årsak, brevmal) => {
        const request = transformerSkjemaData({
            skjemaverdier: {
                ...standardSkjemaverdier,
                årsak,
                fritekstAvsnitt: 'Dette er en fritekst.',
            },
            bruker,
            manuelleBrevmottakerePåFagsak,
        });

        expect(request).toEqual({
            mottakerIdent: bruker.personIdent,
            mottakerNavn: bruker.navn,
            mottakerMålform: Målform.NB,
            multiselectVerdier: [],
            barnIBrev: [],
            brevmal,
            manuelleBrevmottakere: manuelleBrevmottakerePåFagsak,
            fritekstAvsnitt: 'Dette er en fritekst.',
        });
    });

    test('nynorsk målform tas med i mottakerMålform', () => {
        const request = transformerSkjemaData({
            skjemaverdier: {
                ...standardSkjemaverdier,
                årsak: DokumentÅrsak.KAN_SØKE_EØS,
                målform: Målform.NN,
            },
            bruker,
            manuelleBrevmottakerePåFagsak: [],
        });

        expect(request.mottakerMålform).toBe(Målform.NN);
    });

    test('kaster eksplisitt feil dersom årsaken ikke har en brevmal', () => {
        const ukjentÅrsak = 'UKJENT_ÅRSAK' as DokumentÅrsak;

        expect(() =>
            transformerSkjemaData({
                skjemaverdier: { ...standardSkjemaverdier, årsak: ukjentÅrsak },
                bruker,
                manuelleBrevmottakerePåFagsak: [],
            })
        ).toThrow(`Fant ingen brevmal for årsak ${ukjentÅrsak}`);
    });
});
