import { kjønnType } from '@navikt/familie-typer';

import { type IGrunnlagPerson, PersonType } from '../person';
import { Målform } from '../søknad';
import {
    finnUnikeIdenterForPersonTypeIUtbetalingsperioder,
    finnUtbetalingsperioderHvorTomErEnBestemtMåned,
    type Utbetalingsperiode,
} from '../utbetalingsperiode';
import { type IUtbetalingsperiodeDetalj, Vedtaksperiodetype } from '../vedtaksperiode';

describe('Tester for metoden finnUnikeIdenterForPersonTypeIUtbetalingsperioder', () => {
    test('skal finne unike identer for person type i utbetalingsperioder', () => {
        // Arrange
        const barn1: IGrunnlagPerson = {
            fødselsdato: '2023-08-01',
            kjønn: kjønnType.MANN,
            navn: 'Albus',
            personIdent: '12345678901',
            type: PersonType.BARN,
            målform: Målform.NB,
        };

        const barn2: IGrunnlagPerson = {
            fødselsdato: '2023-08-01',
            kjønn: kjønnType.MANN,
            navn: 'Albus',
            personIdent: '12345678902',
            type: PersonType.BARN,
            målform: Målform.NB,
        };

        const søker: IGrunnlagPerson = {
            fødselsdato: '1993-08-01',
            kjønn: kjønnType.MANN,
            navn: 'Harry',
            personIdent: '12345678903',
            type: PersonType.SØKER,
            målform: Målform.NB,
        };

        const utbetalingsperiodeDetaljForBarn1: IUtbetalingsperiodeDetalj = {
            person: barn1,
            utbetaltPerMnd: 1,
            prosent: 50,
            erPåvirketAvEndring: false,
        };

        const utbetalingsperiodeDetaljForBarn2: IUtbetalingsperiodeDetalj = {
            person: barn2,
            utbetaltPerMnd: 1,
            prosent: 50,
            erPåvirketAvEndring: false,
        };

        const utbetalingsperiodeDetaljForSøker: IUtbetalingsperiodeDetalj = {
            person: søker,
            utbetaltPerMnd: 1,
            prosent: 50,
            erPåvirketAvEndring: false,
        };

        const utbetalingsperioder: Utbetalingsperiode[] = [
            {
                periodeFom: '2024-01-01',
                periodeTom: '2024-05-31',
                vedtaksperiodetype: Vedtaksperiodetype.UTBETALING,
                utbetalingsperiodeDetaljer: [utbetalingsperiodeDetaljForSøker],
                antallBarn: 1,
                utbetaltPerMnd: 1,
            },
            {
                periodeFom: '2024-05-01',
                periodeTom: '2024-07-31',
                vedtaksperiodetype: Vedtaksperiodetype.UTBETALING,
                utbetalingsperiodeDetaljer: [utbetalingsperiodeDetaljForBarn1],
                antallBarn: 1,
                utbetaltPerMnd: 1,
            },
            {
                periodeFom: '2024-08-01',
                periodeTom: '2024-10-31',
                vedtaksperiodetype: Vedtaksperiodetype.UTBETALING,
                utbetalingsperiodeDetaljer: [utbetalingsperiodeDetaljForBarn2],
                antallBarn: 1,
                utbetaltPerMnd: 1,
            },
        ];

        // Act
        const identer = finnUnikeIdenterForPersonTypeIUtbetalingsperioder(
            utbetalingsperioder,
            PersonType.BARN
        );

        // Assert
        expect(identer).toHaveLength(2);
        expect(identer).toContain('12345678901');
        expect(identer).toContain('12345678902');
    });
});

describe('Tester for metoden finnUtbetalingsperioderHvorTomErEnBestemtMåned', () => {
    test('skal filtrer bort hvor periode tom er dagen før den bestemte måneden', () => {
        // Arrange
        const utbetalingsperioder: Utbetalingsperiode[] = [
            {
                periodeFom: '2024-01-01',
                periodeTom: '2024-07-31',
                vedtaksperiodetype: Vedtaksperiodetype.UTBETALING,
                utbetalingsperiodeDetaljer: [],
                antallBarn: 1,
                utbetaltPerMnd: 1,
            },
        ];

        // Act
        const utbetalingsperioderHvorTomErEnBestemtMåned =
            finnUtbetalingsperioderHvorTomErEnBestemtMåned(utbetalingsperioder, new Date(2024, 7));

        // Assert
        expect(utbetalingsperioderHvorTomErEnBestemtMåned).toHaveLength(0);
    });

    test('skal filtrer bort hvor periode tom er dagen etter den bestemte måneden', () => {
        // Arrange
        const utbetalingsperioder: Utbetalingsperiode[] = [
            {
                periodeFom: '2024-01-01',
                periodeTom: '2024-09-01',
                vedtaksperiodetype: Vedtaksperiodetype.UTBETALING,
                utbetalingsperiodeDetaljer: [],
                antallBarn: 1,
                utbetaltPerMnd: 1,
            },
        ];

        // Act
        const utbetalingsperioderHvorTomErEnBestemtMåned =
            finnUtbetalingsperioderHvorTomErEnBestemtMåned(utbetalingsperioder, new Date(2024, 7));

        // Assert
        expect(utbetalingsperioderHvorTomErEnBestemtMåned).toHaveLength(0);
    });

    test('skal filtrer bort hvor periode tom er undefined', () => {
        // Arrange
        const utbetalingsperioder: Utbetalingsperiode[] = [
            {
                periodeFom: '2024-01-01',
                periodeTom: undefined,
                vedtaksperiodetype: Vedtaksperiodetype.UTBETALING,
                utbetalingsperiodeDetaljer: [],
                antallBarn: 1,
                utbetaltPerMnd: 1,
            },
        ];

        // Act
        const utbetalingsperioderHvorTomErEnBestemtMåned =
            finnUtbetalingsperioderHvorTomErEnBestemtMåned(utbetalingsperioder, new Date(2024, 7));

        // Assert
        expect(utbetalingsperioderHvorTomErEnBestemtMåned).toHaveLength(0);
    });

    test('skal finner utbetalingsperiode hvor periode tom er første dag i den bestemte måneden', () => {
        // Arrange
        const utbetalingsperioder: Utbetalingsperiode[] = [
            {
                periodeFom: '2024-01-01',
                periodeTom: '2024-08-01',
                vedtaksperiodetype: Vedtaksperiodetype.UTBETALING,
                utbetalingsperiodeDetaljer: [],
                antallBarn: 1,
                utbetaltPerMnd: 1,
            },
        ];

        // Act
        const utbetalingsperioderHvorTomErEnBestemtMåned =
            finnUtbetalingsperioderHvorTomErEnBestemtMåned(utbetalingsperioder, new Date(2024, 7));

        // Assert
        expect(utbetalingsperioderHvorTomErEnBestemtMåned).toHaveLength(1);
        expect(utbetalingsperioderHvorTomErEnBestemtMåned[0].periodeTom).toBe('2024-08-01');
    });

    test('skal finner utbetalingsperiode hvor periode tom er siste dag i den bestemte måneden', () => {
        // Arrange
        const utbetalingsperioder: Utbetalingsperiode[] = [
            {
                periodeFom: '2024-01-01',
                periodeTom: '2024-08-31',
                vedtaksperiodetype: Vedtaksperiodetype.UTBETALING,
                utbetalingsperiodeDetaljer: [],
                antallBarn: 1,
                utbetaltPerMnd: 1,
            },
        ];

        // Act
        const utbetalingsperioderHvorTomErEnBestemtMåned =
            finnUtbetalingsperioderHvorTomErEnBestemtMåned(utbetalingsperioder, new Date(2024, 7));

        // Assert
        expect(utbetalingsperioderHvorTomErEnBestemtMåned).toHaveLength(1);
        expect(utbetalingsperioderHvorTomErEnBestemtMåned[0].periodeTom).toBe('2024-08-31');
    });

    test('skal finner flere utbetalingsperioder hvor periode tom er den bestemte måneden', () => {
        // Arrange
        const utbetalingsperioder: Utbetalingsperiode[] = [
            {
                periodeFom: '2024-01-01',
                periodeTom: '2024-08-01',
                vedtaksperiodetype: Vedtaksperiodetype.UTBETALING,
                utbetalingsperiodeDetaljer: [],
                antallBarn: 1,
                utbetaltPerMnd: 1,
            },
            {
                periodeFom: '2024-01-01',
                periodeTom: '2024-08-31',
                vedtaksperiodetype: Vedtaksperiodetype.UTBETALING,
                utbetalingsperiodeDetaljer: [],
                antallBarn: 1,
                utbetaltPerMnd: 1,
            },
        ];

        // Act
        const utbetalingsperioderHvorTomErEnBestemtMåned =
            finnUtbetalingsperioderHvorTomErEnBestemtMåned(utbetalingsperioder, new Date(2024, 7));

        // Assert
        expect(utbetalingsperioderHvorTomErEnBestemtMåned).toHaveLength(2);
        expect(utbetalingsperioderHvorTomErEnBestemtMåned[0].periodeTom).toBe('2024-08-01');
        expect(utbetalingsperioderHvorTomErEnBestemtMåned[1].periodeTom).toBe('2024-08-31');
    });
});
