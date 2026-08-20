import { lagBrevmottaker } from '@testutils/testdata/brevmottakerTestdata';
import { lagPerson } from '@testutils/testdata/personTestdata';
import { Målform } from '@typer/søknad';
import { describe, expect, test } from 'vitest';

import { Informasjonsbrev } from '../../Behandling/Høyremeny/Brev/typer';
import { DokumentÅrsak } from '../dokumentÅrsakTyper';
import { transformerSkjemaData } from './transformerSkjemaData';
import type { DokumentutsendingFormValues } from './useDokumentutsendingSkjema';

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

    test('KAN_SØKE_EØS gir enkelt informasjonsbrev uten barn', () => {
        const request = transformerSkjemaData({
            skjemaverdier: { ...standardSkjemaverdier, årsak: DokumentÅrsak.KAN_SØKE_EØS },
            bruker,
            manuelleBrevmottakerePåFagsak: [],
        });

        expect(request).toEqual({
            mottakerIdent: bruker.personIdent,
            mottakerNavn: bruker.navn,
            mottakerMålform: Målform.NB,
            multiselectVerdier: [],
            barnIBrev: [],
            brevmal: Informasjonsbrev.INFORMASJONSBREV_KAN_SØKE_EØS,
            manuelleBrevmottakere: [],
        });
    });

    test('TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_VARSEL_OM_REVURDERING tar med kun merkede barn', () => {
        const request = transformerSkjemaData({
            skjemaverdier: {
                ...standardSkjemaverdier,
                årsak: DokumentÅrsak.TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_VARSEL_OM_REVURDERING,
                valgteBarn: [barn1, barn2],
            },
            bruker,
            manuelleBrevmottakerePåFagsak: [],
        });

        expect(request.barnIBrev).toEqual([barn1.ident]);
        expect(request.multiselectVerdier).toEqual(['Barn født 01.01.2010.']);
        expect(request.brevmal).toBe(
            Informasjonsbrev.INFORMASJONSBREV_TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_VARSEL_OM_REVURDERING
        );
    });

    test('TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HAR_FÅTT_EN_SØKNAD_FRA_ANNEN_FORELDER tar med kun merkede barn', () => {
        const request = transformerSkjemaData({
            skjemaverdier: {
                ...standardSkjemaverdier,
                årsak: DokumentÅrsak.TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HAR_FÅTT_EN_SØKNAD_FRA_ANNEN_FORELDER,
                valgteBarn: [barn1, barn2],
            },
            bruker,
            manuelleBrevmottakerePåFagsak: [],
        });

        expect(request.barnIBrev).toEqual([barn1.ident]);
        expect(request.brevmal).toBe(
            Informasjonsbrev.INFORMASJONSBREV_TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HAR_FÅTT_EN_SØKNAD_FRA_ANNEN_FORELDER
        );
    });

    test('TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HENTER_IKKE_REGISTEROPPLYSNINGER tar med kun merkede barn', () => {
        const request = transformerSkjemaData({
            skjemaverdier: {
                ...standardSkjemaverdier,
                årsak: DokumentÅrsak.TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HENTER_IKKE_REGISTEROPPLYSNINGER,
                valgteBarn: [barn1, barn2],
            },
            bruker,
            manuelleBrevmottakerePåFagsak: [],
        });

        expect(request.barnIBrev).toEqual([barn1.ident]);
        expect(request.brevmal).toBe(
            Informasjonsbrev.INFORMASJONSBREV_TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HENTER_IKKE_REGISTEROPPLYSNINGER
        );
    });

    test('KAN_HA_RETT_TIL_PENGESTØTTE_FRA_NAV tar med kun merkede barn', () => {
        const request = transformerSkjemaData({
            skjemaverdier: {
                ...standardSkjemaverdier,
                årsak: DokumentÅrsak.KAN_HA_RETT_TIL_PENGESTØTTE_FRA_NAV,
                valgteBarn: [barn1, barn2],
            },
            bruker,
            manuelleBrevmottakerePåFagsak: [],
        });

        expect(request.barnIBrev).toEqual([barn1.ident]);
        expect(request.brevmal).toBe(Informasjonsbrev.INFORMASJONSBREV_KAN_HA_RETT_TIL_PENGESTØTTE_FRA_NAV);
    });

    test('INNHENTE_OPPLYSNINGER_KLAGE tar med fritekstAvsnitt og ingen barn', () => {
        const manuelleBrevmottakerePåFagsak = [lagBrevmottaker()];

        const request = transformerSkjemaData({
            skjemaverdier: {
                ...standardSkjemaverdier,
                årsak: DokumentÅrsak.INNHENTE_OPPLYSNINGER_KLAGE,
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
            brevmal: Informasjonsbrev.INFORMASJONSBREV_INNHENTE_OPPLYSNINGER_KLAGE,
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
});
