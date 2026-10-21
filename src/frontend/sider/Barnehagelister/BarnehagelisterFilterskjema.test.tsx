import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { BarnehagebarnRequestParams } from '@typer/barnehagebarn';
import { describe, expect, test, vi } from 'vitest';

import BarnehagelisterFilterskjema from './BarnehagelisterFilterskjema';

vi.mock('../../hooks/useHentBydeler', () => ({
    useHentBydeler: () => ({
        data: [
            { organisasjonsnummer: '974778726', navn: 'Sagene' },
            { organisasjonsnummer: '971179686', navn: 'St. Hanshaugen' },
        ],
        isError: false,
    }),
}));

const barnehagebarnRequestParams: BarnehagebarnRequestParams = {
    ident: '',
    kommuneNavn: '',
    kunLøpendeAndel: false,
    bydelOrgNummer: '',
    sortBy: 'kommuneNavn',
    sortAsc: false,
};

const renderFilterskjema = () =>
    render(
        <BarnehagelisterFilterskjema
            oppdaterFiltrering={vi.fn()}
            barnehageKommuner={() => ['Oslo', 'Voss']}
            barnehagebarnRequestParams={barnehagebarnRequestParams}
        />
    );

const velgKommune = async (kommune: string) => {
    await userEvent.click(screen.getByRole('combobox', { name: 'Kommunenavn' }));
    await userEvent.click(await screen.findByRole('option', { name: kommune }));
};

describe('BarnehagelisterFilterskjema', () => {
    test('bydel er deaktivert når Oslo ikke er valgt', () => {
        // Act
        renderFilterskjema();

        // Assert
        expect(screen.getByLabelText('Bydel (Kun Oslo)')).toBeDisabled();
    });

    test('bydel er aktiv når Oslo er valgt', async () => {
        // Arrange
        renderFilterskjema();

        // Act
        await velgKommune('Oslo');

        // Assert
        expect(screen.getByLabelText('Bydel (Kun Oslo)')).toBeEnabled();
    });

    test('bydel nullstilles til alle bydeler når man bytter fra Oslo til en annen kommune', async () => {
        // Arrange
        renderFilterskjema();
        await velgKommune('Oslo');
        await userEvent.selectOptions(screen.getByLabelText('Bydel (Kun Oslo)'), 'Sagene');

        // Act
        await velgKommune('Voss');

        // Assert
        const bydel = screen.getByLabelText('Bydel (Kun Oslo)');
        expect(bydel).toBeDisabled();
        expect(bydel).toHaveValue('');
    });
});
