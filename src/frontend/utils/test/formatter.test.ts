import { addDays, setDefaultOptions, subDays, subYears } from 'date-fns';
import { nb } from 'date-fns/locale';

import { dagensDato, dateTilIsoDatoString } from '../dato';
import { formaterIdent, hentAlder, kunSiffer } from '../formatter';

describe('utils/formatter', () => {
    beforeAll(() => {
        // Setter default locale til norsk bokmål for date-fns
        setDefaultOptions({ locale: nb });
    });
    test('Skal formatere ident', () => {
        expect(formaterIdent('12345678910')).toBe('123456 78910');
    });

    test('Tester at kunSiffer håndterer negative tall, desimaler og bokstaver riktig', () => {
        expect(kunSiffer('0123')).toBe(true);
        expect(kunSiffer('-123')).toBe(false);
        expect(kunSiffer('123.4')).toBe(false);
        expect(kunSiffer('123,4')).toBe(false);
        expect(kunSiffer('abc')).toBe(false);
        expect(kunSiffer('1a3')).toBe(false);
    });

    test('Skal formatere orgnr', () => {
        expect(formaterIdent('123456789')).toBe('123 456 789');
    });

    test('Skal returnere ukjent ident når identen ikke er numerisk', () => {
        expect(formaterIdent('avsenderid')).toBe('Ukjent id');
    });

    test('Skal returnere ukjent ident når feil lengde på numerisk ident', () => {
        expect(formaterIdent('123456789123')).toBe('Ukjent id');
    });

    test('Skal hente riktig alder fra fødselsdato', () => {
        const toÅrSiden = subYears(dagensDato, 2);
        expect(hentAlder(dateTilIsoDatoString(subDays(toÅrSiden, 1)))).toBe(2);
    });

    test('Skal hente riktig alder før og etter fødselsdato', () => {
        const toÅrSiden = subYears(dagensDato, 2);
        expect(hentAlder(dateTilIsoDatoString(subDays(toÅrSiden, 1)))).toBe(2);
        expect(hentAlder(dateTilIsoDatoString(addDays(toÅrSiden, 1)))).toBe(1);
    });
});
