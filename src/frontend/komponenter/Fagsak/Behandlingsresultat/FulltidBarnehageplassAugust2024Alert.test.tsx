import React from 'react';

import { render } from '@testing-library/react';

import { FulltidBarnehageplassAugust2024Alert } from './FulltidBarnehageplassAugust2024Alert';
import { type Utbetalingsperiode, Vedtaksperiodetype } from '../../../typer/vedtaksperiode';

describe('FulltidBarnehageplassAugust2024Alert', () => {
    test('skal ikke rendre komponent om ingen utbetalingsperioder har tom i august 2024', () => {
        // Act
        render(<FulltidBarnehageplassAugust2024Alert utbetalingsperioder={[]} />);

        // Assert
        // expect(screen.findByRole('Alert')).not.toBeInDocument() TODO : Fix me
    });

    test('skal rendre komponent om minst en utbetalingsperiode har tom i august 2024', () => {
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
        render(<FulltidBarnehageplassAugust2024Alert utbetalingsperioder={utbetalingsperioder} />);

        // Assert
        // expect(screen.findByRole('Alert')).toBeInDocument() TODO : Fix me
    });
});
