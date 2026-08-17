import type { PropsWithChildren } from 'react';

import { act, renderHook } from '@testing-library/react';
import { lagPerson } from '@testutils/testdata/personTestdata';
import { ForelderBarnRelasjonRolle } from '@typer/person';
import { Adressebeskyttelsegradering } from '@typer/person';
import { Målform } from '@typer/søknad';
import { describe, expect, test } from 'vitest';

import { BrukerProvider } from '../../BrukerContext';
import { DokumentÅrsak } from '../dokumentÅrsakTyper';
import { DokumentutsendingFeltnavn, useDokumentutsendingSkjema } from './useDokumentutsendingSkjema';

const barnRelasjon = {
    adressebeskyttelseGradering: Adressebeskyttelsegradering.UGRADERT,
    fødselsdato: '2015-05-17',
    navn: 'Barn Barnesen',
    personIdent: '17051512345',
    relasjonRolle: ForelderBarnRelasjonRolle.BARN,
};

const morRelasjon = {
    ...barnRelasjon,
    navn: 'Mor Barnesen',
    personIdent: '11111111111',
    relasjonRolle: ForelderBarnRelasjonRolle.MOR,
};

function lagWrapper(bruker: ReturnType<typeof lagPerson>) {
    return function Wrapper({ children }: PropsWithChildren) {
        return <BrukerProvider bruker={bruker}>{children}</BrukerProvider>;
    };
}

describe('useDokumentutsendingSkjema', () => {
    test('bygger standardverdier med barn fra brukerens forelderBarnRelasjon', () => {
        const bruker = lagPerson({ forelderBarnRelasjon: [barnRelasjon, morRelasjon] });

        const { result } = renderHook(() => useDokumentutsendingSkjema(), { wrapper: lagWrapper(bruker) });

        const defaultValues = result.current.getValues();

        expect(defaultValues.valgteBarn).toHaveLength(1);
        expect(defaultValues.valgteBarn[0]).toEqual({
            merket: false,
            ident: barnRelasjon.personIdent,
            navn: barnRelasjon.navn,
            fødselsdato: barnRelasjon.fødselsdato,
            manueltRegistrert: false,
            erFolkeregistrert: true,
        });
    });

    test('øvrige standardverdier er tomme, målform er forhåndsvalgt til bokmål', () => {
        const bruker = lagPerson({ forelderBarnRelasjon: [] });

        const { result } = renderHook(() => useDokumentutsendingSkjema(), { wrapper: lagWrapper(bruker) });

        const defaultValues = result.current.getValues();

        expect(defaultValues.årsak).toBe('');
        expect(defaultValues.målform).toBe(Målform.NB);
        expect(defaultValues.fritekstAvsnitt).toBe('');
        expect(defaultValues.valgteBarn).toEqual([]);
    });

    test('nullstillSkjemaMedÅrsak nullstiller alle felter, men beholder valgt årsak', () => {
        const bruker = lagPerson({ forelderBarnRelasjon: [barnRelasjon] });

        const { result } = renderHook(() => useDokumentutsendingSkjema(), { wrapper: lagWrapper(bruker) });

        act(() => {
            result.current.setValue(DokumentutsendingFeltnavn.FRITEKST_AVSNITT, 'Noe tekst');
            result.current.setValue(DokumentutsendingFeltnavn.MÅLFORM, Målform.NN);
        });

        act(() => {
            result.current.nullstillSkjemaMedÅrsak(DokumentÅrsak.INNHENTE_OPPLYSNINGER_KLAGE);
        });

        const verdier = result.current.getValues();
        expect(verdier.årsak).toBe(DokumentÅrsak.INNHENTE_OPPLYSNINGER_KLAGE);
        expect(verdier.fritekstAvsnitt).toBe('');
        expect(verdier.målform).toBe(Målform.NB);
        expect(verdier.valgteBarn).toHaveLength(1);
        expect(verdier.valgteBarn[0].merket).toBe(false);
    });
});
