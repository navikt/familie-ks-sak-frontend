import { byggSuksessRessurs } from '@navikt/familie-typer';
import type { Page } from '@playwright/test';
import { OppgaveTestdata } from '@testutils/testdata/oppgaveTestdata';
import { IdentGruppe, type IOppgave } from '@typer/oppgave';
import { HttpResponse, http } from 'msw';

import type { ApiMock } from '../apiMock';
import { expect, test } from '../fixtures';

const HENT_OPPGAVER_URL = '/familie-ks-sak/api/oppgave/hent-oppgaver';
const FORDEL_OPPGAVE_URL = '/familie-ks-sak/api/oppgave/:oppgaveId/fordel';

const JOURNALFØRING = OppgaveTestdata.lagOppgave({
    id: '2',
    oppgavetype: 'JFR',
    beskrivelse: 'Journalføring',
    journalpostId: '1',
    identer: [{ ident: '10022412345', gruppe: IdentGruppe.FOLKEREGISTERIDENT }],
    opprettetTidspunkt: '2026-10-02T08:00:00.000',
    fristFerdigstillelse: '2026-10-10',
});

async function velgEnhetOgHentOppgaver(page: Page, apiMock: ApiMock, oppgaver: IOppgave[]) {
    apiMock.use(
        http.post(HENT_OPPGAVER_URL, () =>
            HttpResponse.json(byggSuksessRessurs(OppgaveTestdata.lagHentOppgaveDto(oppgaver)))
        )
    );
    await page.getByRole('combobox', { name: 'Enhet' }).selectOption({ label: '4833 Oslo' });
    await page.getByRole('button', { name: 'Hent oppgaver' }).click();
}

function oppgaverad(page: Page, ident: string) {
    return page.getByRole('row').filter({ has: page.getByRole('cell', { name: ident, exact: true }) });
}

test.describe('Oppgavebenken', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/oppgaver');
        await expect(page.getByRole('heading', { name: 'Oppgavebenken' })).toBeVisible();
    });

    test('skal kreve at enhet er valgt før oppgaver hentes', async ({ page }) => {
        await page.getByRole('button', { name: 'Hent oppgaver' }).click();

        await expect(page.getByText('Du må velge enhet')).toBeVisible();
        await expect(page.getByRole('combobox', { name: 'Enhet' })).toHaveAttribute('aria-invalid', 'true');
    });

    test('skal hente og vise oppgaver for valgt enhet', async ({ page }) => {
        await page.getByRole('combobox', { name: 'Enhet' }).selectOption({ label: '4833 Oslo' });

        const hentOppgaverRequest = page.waitForRequest(`**${HENT_OPPGAVER_URL}`);
        await page.getByRole('button', { name: 'Hent oppgaver' }).click();

        expect((await hentOppgaverRequest).postDataJSON()).toEqual({ enhet: '4833', limit: 150, offset: 0 });
        await expect(oppgaverad(page, '12345678910').getByRole('cell')).toHaveText([
            '01.10.26',
            'Behandle sak',
            'Nasjonal',
            '15.10.26',
            'Normal',
            'Behandle sak',
            '12345678910',
            '4833 Oslo',
            'Ikke tildeltTildel meg',
            'Gå til fagsak',
        ]);
        await expect(page.getByText('Viser 1 - 1 av 1 oppgaver (totalt 1 oppgaver)')).toBeVisible();
    });

    test('skal sende valgte filtre når oppgaver hentes, og nullstille dem ved tilbakestilling', async ({ page }) => {
        await page.getByRole('combobox', { name: 'Oppgavetype' }).selectOption({ label: 'Journalføring' });
        await page.getByRole('combobox', { name: 'Behandlingstype' }).selectOption({ label: 'Nasjonal' });
        await page.getByRole('combobox', { name: 'Enhet' }).selectOption({ label: '4833 Oslo' });
        await page.getByRole('combobox', { name: 'Saksbehandler' }).selectOption({ label: 'Ufordelte' });

        await expect(page).toHaveURL(
            /oppgavetype=JFR&behandlingstype=ae0118&tildeltEnhetsnr=E4833&tilordnetRessurs=UFORDELTE/
        );

        const hentOppgaverRequest = page.waitForRequest(`**${HENT_OPPGAVER_URL}`);
        await page.getByRole('button', { name: 'Hent oppgaver' }).click();

        expect((await hentOppgaverRequest).postDataJSON()).toEqual({
            oppgavetype: 'JFR',
            behandlingstype: 'ae0118',
            enhet: '4833',
            tildeltRessurs: false,
            limit: 150,
            offset: 0,
        });

        await page.getByRole('button', { name: 'Tilbakestill filtrering' }).click();

        await expect(page.getByRole('combobox', { name: 'Oppgavetype' })).toHaveValue('ALLE');
        await expect(page.getByRole('combobox', { name: 'Behandlingstype' })).toHaveValue('ALLE');
        await expect(page.getByRole('combobox', { name: 'Enhet' })).toHaveValue('VELG');
        await expect(page.getByRole('combobox', { name: 'Saksbehandler' })).toHaveValue('ALLE');
    });

    test('skal tildele journalføringsoppgaven til innlogget saksbehandler og åpne den', async ({ page, apiMock }) => {
        apiMock.use(http.post(FORDEL_OPPGAVE_URL, () => HttpResponse.json(byggSuksessRessurs('2'))));
        await velgEnhetOgHentOppgaver(page, apiMock, [JOURNALFØRING]);

        const tilgangRequest = page.waitForRequest('**/familie-ks-sak/api/tilgang');
        const fordelRequest = page.waitForRequest('**/familie-ks-sak/api/oppgave/2/fordel?saksbehandler=A1');
        await oppgaverad(page, '10022412345').getByRole('button', { name: 'Tildel meg' }).click();

        expect((await tilgangRequest).postDataJSON()).toEqual({ brukerIdent: '10022412345' });
        await fordelRequest;
        await expect(page).toHaveURL(/\/oppgaver\/journalfor\/2$/);
        await expect(page.getByRole('heading', { name: 'Journalføring', level: 2 })).toBeVisible();
    });
});
