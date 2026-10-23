import { byggFeiletRessurs, byggSuksessRessurs } from '@navikt/familie-typer';
import type { Page } from '@playwright/test';
import { BarnehagebarnTestdata } from '@testutils/testdata/barnehagebarnTestdata';
import { HttpResponse, http } from 'msw';

import { expect, test } from '../fixtures';

const BARNEHAGEBARNLISTE_URL = '/familie-ks-sak/api/barnehagebarn/barnehagebarnliste';

const STANDARD_FORESPØRSEL = {
    ident: '',
    kommuneNavn: '',
    kunLøpendeAndel: false,
    limit: 20,
    offset: 0,
    sortBy: 'kommuneNavn',
    sortAsc: false,
};

function barnehagebarnrad(page: Page, ident: string) {
    return page.getByRole('row').filter({ has: page.getByRole('cell', { name: ident, exact: true }) });
}

test.describe('Barnehagelister', () => {
    test('skal vise barnehagebarn i tabellen', async ({ page }) => {
        const hentBarnehagebarnRequest = page.waitForRequest(`**${BARNEHAGEBARNLISTE_URL}`);
        await page.goto('/barnehagelister');

        await expect(page.getByRole('heading', { name: 'Barnehageliste KS sak' })).toBeVisible();
        expect((await hentBarnehagebarnRequest).postDataJSON()).toEqual(STANDARD_FORESPØRSEL);
        await expect(barnehagebarnrad(page, '10022412345').getByRole('cell')).toHaveText([
            '10022412345',
            '15.08.25 10:00',
            '01.08.25',
            '',
            '20',
            'NY',
            'Nei',
            'Oslo',
            '0301',
            'LØPENDE',
            'Gå til saksoversikt',
        ]);
        await expect(page.getByText('Side 1 av 1 (1 - 1 av 1 totalt)')).toBeVisible();
    });

    test('skal sende valgte filtre når barnehagebarn filtreres', async ({ page, apiMock }) => {
        await page.goto('/barnehagelister');
        await expect(barnehagebarnrad(page, '10022412345')).toBeVisible();

        apiMock.use(
            http.post(BARNEHAGEBARNLISTE_URL, () =>
                HttpResponse.json(
                    byggSuksessRessurs(
                        BarnehagebarnTestdata.lagBarnehagebarnResponse([
                            BarnehagebarnTestdata.lagBarnehagebarn({
                                ident: '15032400067',
                                kommuneNavn: 'Bergen',
                                kommuneNr: '4601',
                            }),
                        ])
                    )
                )
            )
        );

        await page.getByRole('combobox', { name: 'Kommunenavn' }).click();
        await page.getByRole('option', { name: 'Bergen' }).click();
        await page.getByRole('checkbox', { name: 'Kun løpende utbetalinger' }).check();

        const filtrerRequest = page.waitForRequest(`**${BARNEHAGEBARNLISTE_URL}`);
        await page.getByRole('button', { name: 'Filtrer' }).click();

        // Når en kommune velges, nullstilles identfeltet, og det sendes derfor ikke med i forespørselen.
        expect((await filtrerRequest).postDataJSON()).toEqual({
            kommuneNavn: 'Bergen',
            kunLøpendeAndel: true,
            limit: 20,
            offset: 0,
            sortBy: 'kommuneNavn',
            sortAsc: false,
        });
        await expect(barnehagebarnrad(page, '15032400067')).toContainText('Bergen');
        await expect(barnehagebarnrad(page, '10022412345')).toHaveCount(0);
    });

    test('skal sortere på kolonnen som velges', async ({ page }) => {
        await page.goto('/barnehagelister');
        await expect(page.getByRole('columnheader', { name: 'Kommunenavn' })).toHaveAttribute(
            'aria-sort',
            'descending'
        );

        // Ny kolonne beholder gjeldende sorteringsretning.
        const førsteSorteringRequest = page.waitForRequest(`**${BARNEHAGEBARNLISTE_URL}`);
        await page.getByRole('button', { name: 'Barns ident' }).click();

        expect((await førsteSorteringRequest).postDataJSON()).toEqual({
            ...STANDARD_FORESPØRSEL,
            sortBy: 'ident',
            sortAsc: false,
        });
        await expect(page.getByRole('columnheader', { name: 'Barns ident' })).toHaveAttribute(
            'aria-sort',
            'descending'
        );

        // Samme kolonne snur sorteringsretningen.
        const andreSorteringRequest = page.waitForRequest(`**${BARNEHAGEBARNLISTE_URL}`);
        await page.getByRole('button', { name: 'Barns ident' }).click();

        expect((await andreSorteringRequest).postDataJSON()).toEqual({
            ...STANDARD_FORESPØRSEL,
            sortBy: 'ident',
            sortAsc: true,
        });
        await expect(page.getByRole('columnheader', { name: 'Barns ident' })).toHaveAttribute('aria-sort', 'ascending');
    });

    test('skal fjerne filtrene og vise hele listen igjen', async ({ page, apiMock }) => {
        const barnIOslo = BarnehagebarnTestdata.lagBarnehagebarn();
        const barnIBergen = BarnehagebarnTestdata.lagBarnehagebarn({
            ident: '15032400067',
            kommuneNavn: 'Bergen',
            kommuneNr: '4601',
        });

        apiMock.use(
            http.post<never, { ident: string }>(BARNEHAGEBARNLISTE_URL, async ({ request }) => {
                const { ident } = await request.json();
                const barn = ident === '15032400067' ? [barnIBergen] : [barnIOslo, barnIBergen];
                return HttpResponse.json(byggSuksessRessurs(BarnehagebarnTestdata.lagBarnehagebarnResponse(barn)));
            })
        );

        await page.goto('/barnehagelister');

        const valgtKommune = page.getByRole('listitem').filter({ hasText: 'Oslo' });

        await page.getByRole('combobox', { name: 'Kommunenavn' }).click();
        await page.getByRole('option', { name: 'Oslo' }).click();
        await expect(valgtKommune).toBeVisible();

        await page.getByRole('textbox', { name: 'Barns ident' }).fill('15032400067');
        await expect(valgtKommune).toHaveCount(0);

        await page.goto('/barnehagelister');
        await expect(barnehagebarnrad(page, '10022412345')).toBeVisible();
        await expect(barnehagebarnrad(page, '15032400067')).toBeVisible();
    });

    test('skal bla mellom sider og endre antall per side', async ({ page, apiMock }) => {
        const barn = Array.from({ length: 3 }, (_, i) =>
            BarnehagebarnTestdata.lagBarnehagebarn({ ident: `1002241234${i}` })
        );

        apiMock.use(
            http.post<never, { offset: number; limit: number }>(BARNEHAGEBARNLISTE_URL, async ({ request }) => {
                const { offset, limit } = await request.json();
                const barnPåSiden = barn.slice(offset * limit, (offset + 1) * limit);
                return HttpResponse.json(
                    byggSuksessRessurs({
                        ...BarnehagebarnTestdata.lagBarnehagebarnResponse(barnPåSiden, {
                            side: offset,
                            antallPerSide: limit,
                        }),
                        totalElements: barn.length,
                        totalPages: Math.ceil(barn.length / limit),
                    })
                );
            })
        );

        await page.goto('/barnehagelister');
        await expect(barnehagebarnrad(page, '10022412340')).toBeVisible();

        const antallPerSideRequest = page.waitForRequest(`**${BARNEHAGEBARNLISTE_URL}`);
        await page.getByRole('combobox', { name: 'Antall per side' }).selectOption({ label: 'Vis 2 per side' });

        expect((await antallPerSideRequest).postDataJSON()).toMatchObject({ limit: 2, offset: 0 });
        await expect(page.getByText('Side 1 av 2 (1 - 2 av 3 totalt)')).toBeVisible();

        const side2Request = page.waitForRequest(`**${BARNEHAGEBARNLISTE_URL}`);
        await page.getByRole('button', { name: '2', exact: true }).click();

        expect((await side2Request).postDataJSON()).toMatchObject({ limit: 2, offset: 1 });
        await expect(page.getByText('Side 2 av 2 (3 - 3 av 3 totalt)')).toBeVisible();
        await expect(barnehagebarnrad(page, '10022412342')).toBeVisible();
        await expect(barnehagebarnrad(page, '10022412340')).toHaveCount(0);
    });

    test('skal gå til saksoversikten fra barnehagelisten', async ({ page }) => {
        await page.goto('/barnehagelister');

        const lenke = barnehagebarnrad(page, '10022412345').getByRole('link', { name: 'Gå til saksoversikt' });
        await expect(lenke).toHaveAttribute('title', 'FagsakId: 1');
        await expect(lenke).toHaveAttribute('href', '/fagsak/1/saksoversikt');

        await lenke.click();

        await expect(page).toHaveURL(/\/fagsak\/1\/saksoversikt$/);
        await expect(page.getByRole('heading', { level: 1, name: 'Saksoversikt', exact: true })).toBeVisible();
    });

    test('skal bruke reservekommuner når kommunelisten ikke kan hentes', async ({ page, apiMock }) => {
        apiMock.use(
            http.get('/familie-ks-sak/api/barnehagebarn/barnehagekommuner', () =>
                HttpResponse.json(byggFeiletRessurs('Feil'), { status: 500 })
            )
        );

        await page.goto('/barnehagelister');
        await page.getByRole('combobox', { name: 'Kommunenavn' }).click();

        for (const kommune of ['Oslo', 'Voss', 'Frogn']) {
            await expect(page.getByRole('option', { name: kommune, exact: true })).toBeVisible();
        }
        await expect(page.getByRole('option', { name: 'Bergen', exact: true })).toHaveCount(0);
    });
});
