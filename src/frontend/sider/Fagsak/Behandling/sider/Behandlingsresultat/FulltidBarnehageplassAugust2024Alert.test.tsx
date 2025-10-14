import { render, screen } from '@testing-library/react';

import { kjønnType } from '@navikt/familie-typer';

import { FulltidBarnehageplassAugust2024Alert } from './FulltidBarnehageplassAugust2024Alert';
import { YtelseType } from '../../../../../typer/beregning';
import { type IGrunnlagPerson, PersonType } from '../../../../../typer/person';
import { Målform } from '../../../../../typer/søknad';
import type { Utbetalingsperiode } from '../../../../../typer/utbetalingsperiode';
import { type IUtbetalingsperiodeDetalj, Vedtaksperiodetype } from '../../../../../typer/vedtaksperiode';

describe('FulltidBarnehageplassAugust2024Alert', () => {
    test('skal ikke rendre komponent om ingen utbetalingsperioder har tom i august 2024', () => {
        // Act
        render(<FulltidBarnehageplassAugust2024Alert utbetalingsperioder={[]} />);

        // Assert
        expect(screen.queryByRole('img', { name: 'Advarsel' })).not.toBeInTheDocument();
        expect(
            screen.queryByText(
                'Det er perioder som kan føre til utbetaling for barn 123456 78901, 123456 78902. ' +
                    'Kontroller om barnet hører inn under regelverk før lovendring 1. august 24. ' +
                    'Bruk «Endret utbetalingsperiode» for å stoppe etterbetalingen hvis barnet hadde ' +
                    'fulltidsplass i barnehage i august 24.'
            )
        ).not.toBeInTheDocument();
    });

    test('skal rendre komponent hvor utbetalingsperiode har tom i august 2024 for to barn', () => {
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
            navn: 'Harry',
            personIdent: '12345678902',
            type: PersonType.BARN,
            målform: Målform.NB,
        };

        const utbetalingsperiodeDetaljForBarn1: IUtbetalingsperiodeDetalj = {
            person: barn1,
            utbetaltPerMnd: 1,
            prosent: 50,
            ytelseType: YtelseType.ORDINÆR_KONTANTSTØTTE,
            erPåvirketAvEndring: false,
        };

        const utbetalingsperiodeDetaljForBarn2: IUtbetalingsperiodeDetalj = {
            person: barn2,
            utbetaltPerMnd: 1,
            prosent: 50,
            ytelseType: YtelseType.ORDINÆR_KONTANTSTØTTE,
            erPåvirketAvEndring: false,
        };

        const utbetalingsperioder: Utbetalingsperiode[] = [
            {
                periodeFom: '2024-05-01',
                periodeTom: '2024-08-01',
                vedtaksperiodetype: Vedtaksperiodetype.UTBETALING,
                utbetalingsperiodeDetaljer: [utbetalingsperiodeDetaljForBarn1],
                antallBarn: 1,
                utbetaltPerMnd: 1,
            },
            {
                periodeFom: '2024-05-01',
                periodeTom: '2024-08-31',
                vedtaksperiodetype: Vedtaksperiodetype.UTBETALING,
                utbetalingsperiodeDetaljer: [utbetalingsperiodeDetaljForBarn2],
                antallBarn: 1,
                utbetaltPerMnd: 1,
            },
        ];

        // Act
        render(<FulltidBarnehageplassAugust2024Alert utbetalingsperioder={utbetalingsperioder} />);

        // Assert
        expect(screen.getByRole('img', { name: 'Advarsel' })).toBeInTheDocument();
        expect(
            screen.getByText(
                'Det er perioder som kan føre til utbetaling for barn 123456 78901, 123456 78902. ' +
                    'Kontroller om barnet hører inn under regelverk før lovendring 1. august 24. ' +
                    'Bruk «Endret utbetalingsperiode» for å stoppe etterbetalingen hvis barnet hadde ' +
                    'fulltidsplass i barnehage i august 24.'
            )
        ).toBeInTheDocument();
    });

    test('skal rendre komponent hvor utbetalingsperiode har tom i august 2024 for et barn', () => {
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
            navn: 'Harry',
            personIdent: '12345678902',
            type: PersonType.BARN,
            målform: Målform.NB,
        };

        const utbetalingsperiodeDetaljForBarn1: IUtbetalingsperiodeDetalj = {
            person: barn1,
            utbetaltPerMnd: 1,
            prosent: 50,
            ytelseType: YtelseType.ORDINÆR_KONTANTSTØTTE,
            erPåvirketAvEndring: false,
        };

        const utbetalingsperiodeDetaljForBarn2: IUtbetalingsperiodeDetalj = {
            person: barn2,
            utbetaltPerMnd: 1,
            prosent: 50,
            ytelseType: YtelseType.ORDINÆR_KONTANTSTØTTE,
            erPåvirketAvEndring: false,
        };

        const utbetalingsperioder: Utbetalingsperiode[] = [
            {
                periodeFom: '2024-05-01',
                periodeTom: '2024-08-01',
                vedtaksperiodetype: Vedtaksperiodetype.UTBETALING,
                utbetalingsperiodeDetaljer: [utbetalingsperiodeDetaljForBarn1],
                antallBarn: 1,
                utbetaltPerMnd: 1,
            },
            {
                periodeFom: '2024-04-01',
                periodeTom: '2024-07-31',
                vedtaksperiodetype: Vedtaksperiodetype.UTBETALING,
                utbetalingsperiodeDetaljer: [utbetalingsperiodeDetaljForBarn2],
                antallBarn: 1,
                utbetaltPerMnd: 1,
            },
        ];

        // Act
        render(<FulltidBarnehageplassAugust2024Alert utbetalingsperioder={utbetalingsperioder} />);

        // Assert
        expect(screen.getByRole('img', { name: 'Advarsel' })).toBeInTheDocument();
        expect(
            screen.getByText(
                'Det er perioder som kan føre til utbetaling for barn 123456 78901. ' +
                    'Kontroller om barnet hører inn under regelverk før lovendring 1. august 24. ' +
                    'Bruk «Endret utbetalingsperiode» for å stoppe etterbetalingen hvis barnet hadde ' +
                    'fulltidsplass i barnehage i august 24.'
            )
        ).toBeInTheDocument();
    });
});
