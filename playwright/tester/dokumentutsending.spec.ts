import { byggSuksessRessurs } from '@navikt/familie-typer';
import { PersonTestdata } from '@testutils/testdata/personTestdata';
import { HttpResponse, http } from 'msw';

import { expect, test } from '../fixtures';

const SEND_BREV_URL = '/familie-ks-sak/api/brev/fagsak/:fagsakId/send-brev';

const SØKER_MED_BARN = PersonTestdata.lagPerson({
    personIdent: '12345678903',
    forelderBarnRelasjon: [PersonTestdata.lagForelderBarnRelasjon()],
});

const FELLES_BREVFELTER = {
    mottakerIdent: '12345678903',
    mottakerNavn: 'Test Testersen',
    mottakerMålform: 'NB',
    manuelleBrevmottakere: [],
};

test.describe('Dokumentutsending', () => {
    test('skal kreve at årsak er valgt', async ({ page }) => {
        await page.goto('/fagsak/1/dokumentutsending');
        await expect(page.getByRole('heading', { name: 'Send informasjonsbrev' })).toBeVisible();

        await page.getByRole('button', { name: 'Send brev' }).click();

        await expect(page.getByText('Du må velge en årsak')).toBeVisible();
        await expect(page.getByRole('combobox', { name: 'Velg årsak' })).toHaveAttribute('aria-invalid', 'true');
    });

    test('skal sende brevet «Kan søke EØS» og vise bekreftelse', async ({ page, apiMock }) => {
        apiMock.use(http.post(SEND_BREV_URL, () => HttpResponse.json(byggSuksessRessurs(null))));

        await page.goto('/fagsak/1/dokumentutsending');
        await page.getByRole('combobox', { name: 'Velg årsak' }).selectOption({ label: 'Kan søke EØS' });

        const sendBrevRequest = page.waitForRequest('**/familie-ks-sak/api/brev/fagsak/1/send-brev');
        await page.getByRole('button', { name: 'Send brev' }).click();

        expect((await sendBrevRequest).postDataJSON()).toEqual({
            ...FELLES_BREVFELTER,
            multiselectVerdier: [],
            barnIBrev: [],
            brevmal: 'INFORMASJONSBREV_KAN_SØKE_EØS',
        });

        const dialog = page.getByRole('dialog', { name: 'Brev er sendt' });
        await expect(dialog).toBeVisible();

        await dialog.getByRole('button', { name: 'Se saksoversikt' }).click();
        await expect(page).toHaveURL(/\/fagsak\/1\/saksoversikt$/);
    });

    test('skal sende brev med barna som er valgt', async ({ page, apiMock }) => {
        apiMock.use(
            http.post('/familie-ks-sak/api/person', () => HttpResponse.json(byggSuksessRessurs(SØKER_MED_BARN))),
            http.post(SEND_BREV_URL, () => HttpResponse.json(byggSuksessRessurs(null)))
        );

        await page.goto('/fagsak/1/dokumentutsending');
        await page
            .getByRole('combobox', { name: 'Velg årsak' })
            .selectOption({ label: 'Kan ha rett til pengestøtte fra Nav' });

        const barnegruppe = page.getByRole('group', { name: 'Hvilke barn er bosatt med søker?' });
        await barnegruppe.getByRole('checkbox', { name: /Barn Testersen .* \| 100224 12345/ }).check();

        const sendBrevRequest = page.waitForRequest('**/familie-ks-sak/api/brev/fagsak/1/send-brev');
        await page.getByRole('button', { name: 'Send brev' }).click();

        expect((await sendBrevRequest).postDataJSON()).toEqual({
            ...FELLES_BREVFELTER,
            multiselectVerdier: ['Barn født 10.02.2024.'],
            barnIBrev: ['10022412345'],
            brevmal: 'INFORMASJONSBREV_KAN_HA_RETT_TIL_PENGESTØTTE_FRA_NAV',
        });
        await expect(page.getByRole('dialog', { name: 'Brev er sendt' })).toBeVisible();
    });
});
