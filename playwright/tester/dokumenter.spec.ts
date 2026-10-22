import { byggSuksessRessurs, Journalposttype, Journalstatus } from '@navikt/familie-typer';
import { JournalpostTestdata } from '@testutils/testdata/journalpostTestdata';
import type { ITilgangsstyrtJournalpost } from '@typer/journalpost';
import { HttpResponse, http } from 'msw';

import type { ApiMock } from '../apiMock';
import { expect, test } from '../fixtures';

const JOURNALPOSTER_URL = '/familie-ks-sak/api/journalpost/bruker';

const SØKNAD = JournalpostTestdata.lagTilgangsstyrtJournalpost({
    journalpostId: '1',
    tittel: 'Søknad om kontantstøtte',
    datoMottatt: '2026-10-01T08:00:00',
    journalstatus: Journalstatus.JOURNALFOERT,
    sak: { fagsaksystem: 'KONT', fagsakId: '1' },
});

const VEDTAKSBREV = JournalpostTestdata.lagTilgangsstyrtJournalpost({
    journalpostId: '2',
    journalposttype: Journalposttype.U,
    tittel: 'Vedtak om kontantstøtte',
    datoMottatt: '2026-11-15T12:00:00',
    journalstatus: Journalstatus.FERDIGSTILT,
    sak: { fagsaksystem: 'KONT', fagsakId: '1' },
    dokumenter: [JournalpostTestdata.lagDokumentInfo({ dokumentInfoId: '2', tittel: 'Vedtak om kontantstøtte' })],
});

function mockJournalposter(apiMock: ApiMock, journalposter: ITilgangsstyrtJournalpost[]) {
    apiMock.use(http.post(JOURNALPOSTER_URL, () => HttpResponse.json(byggSuksessRessurs(journalposter))));
}

test.describe('Dokumenter', () => {
    test('skal vise journalpostene til bruker', async ({ page, apiMock }) => {
        mockJournalposter(apiMock, [SØKNAD, VEDTAKSBREV]);

        const journalposterRequest = page.waitForRequest(`**${JOURNALPOSTER_URL}`);
        await page.goto('/fagsak/1/dokumenter');

        expect((await journalposterRequest).postDataJSON()).toEqual({ ident: '12345678903' });
        await expect(page.getByRole('heading', { name: 'Dokumentoversikt' })).toBeVisible();

        const søknadsrad = page.getByRole('row', { name: /Søknad om kontantstøtte/ });
        await expect(søknadsrad.getByRole('img', { name: 'Inngående' })).toBeVisible();
        await expect(søknadsrad.getByRole('cell')).toHaveText([
            /I$/,
            '01.10.26 08:00',
            'Søknad om kontantstøtte',
            'Nav Kontantstøtte | 1',
            'Søker Testersen',
            'Søknad om kontantstøtte',
            'Journalført',
        ]);

        const vedtaksrad = page.getByRole('row', { name: /Vedtak om kontantstøtte/ });
        await expect(vedtaksrad.getByRole('img', { name: 'Utgående' })).toBeVisible();
        await expect(vedtaksrad.getByRole('cell')).toHaveText([
            /U$/,
            '15.11.26 12:00',
            'Vedtak om kontantstøtte',
            'Nav Kontantstøtte | 1',
            'Søker Testersen',
            'Vedtak om kontantstøtte',
            'Ferdigstilt',
        ]);
    });

    test('skal åpne dokumentet i en dialog', async ({ page, apiMock }) => {
        mockJournalposter(apiMock, [VEDTAKSBREV]);

        await page.goto('/fagsak/1/dokumenter');

        await expect(page.getByRole('link', { name: 'Åpne dokument i ny fane' })).toHaveAttribute(
            'href',
            '/familie-ks-sak/api/journalpost/2/dokument/2/pdf'
        );

        const dokumentRequest = page.waitForRequest('**/familie-ks-sak/api/journalpost/2/dokument/2');
        await page.getByRole('link', { name: 'Vedtak om kontantstøtte' }).click();
        await dokumentRequest;

        const dialog = page.getByRole('dialog', { name: 'Vedtak om kontantstøtte' });
        await expect(dialog).toBeVisible();
        await expect(dialog.locator('iframe[title="Vedtak om kontantstøtte"]')).toBeVisible();
    });
});
