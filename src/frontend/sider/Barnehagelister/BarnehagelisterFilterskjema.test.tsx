import { byggSuksessRessurs } from '@navikt/familie-typer';
import { server } from '@testutils/mocks/node';
import { render } from '@testutils/testrender';
import type { BarnehagebarnRequestParams } from '@typer/barnehagebarn';
import { delay, HttpResponse, http } from 'msw';
import { describe, expect, test, vi } from 'vitest';

import BarnehagelisterFilterskjema from './BarnehagelisterFilterskjema';

const barnehagebarnRequestParams: BarnehagebarnRequestParams = {
    ident: '',
    kommuneNavn: '',
    kunLøpendeAndel: false,
    bydelOrganisasjonsnummer: '',
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

const velgKommune = async ({ user, screen }: ReturnType<typeof renderFilterskjema>, kommune: string) => {
    await user.click(screen.getByRole('combobox', { name: 'Kommunenavn' }));
    await user.click(await screen.findByRole('option', { name: kommune }));
};

const velgBydel = async ({ user, screen }: ReturnType<typeof renderFilterskjema>, bydel: string) => {
    await screen.findByRole('option', { name: bydel });
    await user.selectOptions(screen.getByLabelText('Bydel (Kun Oslo)'), bydel);
};

describe('BarnehagelisterFilterskjema', () => {
    test('bydel er deaktivert når Oslo ikke er valgt', async () => {
        // Act
        const { screen } = renderFilterskjema();

        // Assert
        await screen.findByRole('option', { name: 'Sagene' });
        expect(screen.getByLabelText('Bydel (Kun Oslo)')).toBeDisabled();
    });

    test('bydel er aktiv når Oslo er valgt', async () => {
        // Arrange
        const rendret = renderFilterskjema();
        await rendret.screen.findByRole('option', { name: 'Sagene' });

        // Act
        await velgKommune(rendret, 'Oslo');

        // Assert
        expect(rendret.screen.getByLabelText('Bydel (Kun Oslo)')).toBeEnabled();
    });

    test('bydel er deaktivert mens bydeler hentes', async () => {
        // Arrange
        server.use(
            http.get('/familie-ks-sak/api/barnehagebarn/bydeler', async () => {
                await delay('infinite');
                return HttpResponse.json(byggSuksessRessurs([]));
            })
        );
        const rendret = renderFilterskjema();

        // Act
        await velgKommune(rendret, 'Oslo');

        // Assert
        expect(rendret.screen.getByLabelText('Bydel (Kun Oslo)')).toBeDisabled();
        expect(rendret.screen.getByRole('option', { name: 'Henter bydeler …' })).toBeInTheDocument();
    });

    test('bydel nullstilles til alle bydeler når man bytter fra Oslo til en annen kommune', async () => {
        // Arrange
        const rendret = renderFilterskjema();
        await velgKommune(rendret, 'Oslo');
        await velgBydel(rendret, 'Sagene');

        // Act
        await velgKommune(rendret, 'Voss');

        // Assert
        const bydel = rendret.screen.getByLabelText('Bydel (Kun Oslo)');
        expect(bydel).toBeDisabled();
        expect(bydel).toHaveValue('');
    });

    test('bydel nullstilles når man skriver inn ident', async () => {
        // Arrange
        const rendret = renderFilterskjema();
        await velgKommune(rendret, 'Oslo');
        await velgBydel(rendret, 'Sagene');

        // Act
        await rendret.user.type(rendret.screen.getByLabelText('Barns ident'), '1');

        // Assert
        const bydel = rendret.screen.getByLabelText('Bydel (Kun Oslo)');
        expect(bydel).toBeDisabled();
        expect(bydel).toHaveValue('');
    });
});
