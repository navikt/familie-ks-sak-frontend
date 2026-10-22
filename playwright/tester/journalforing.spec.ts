import { byggSuksessRessurs } from '@navikt/familie-typer';
import { JournalpostTestdata } from '@testutils/testdata/journalpostTestdata';
import { HttpResponse, http } from 'msw';

import { expect, test } from '../fixtures';

const OPPGAVE_URL = '/familie-ks-sak/api/oppgave/:oppgaveId';
const JOURNALFØR_URL = encodeURI('/familie-ks-sak/api/journalpost/:journalpostId/journalfør/:oppgaveId');

// Ekspansjonsknappen dekker tittelen i kortet, så vi klikker knappen i stedet for tittelteksten.

test.describe('Manuell journalføring', () => {
    test('skal vise journalposten med dokument, bruker og avsender', async ({ page }) => {
        const dokumentRequest = page.waitForRequest('**/familie-ks-sak/api/journalpost/1/dokument/1');

        await page.goto('/oppgaver/journalfor/1');

        await expect(page.getByRole('heading', { name: 'Journalføring', level: 2 })).toBeVisible();
        await expect(
            page.getByRole('region', { name: 'journalpost' }).getByRole('heading', { name: 'Søknad om kontantstøtte' })
        ).toBeVisible();
        await expect(page.getByRole('region', { name: 'Søknad om kontantstøtte' })).toBeVisible();
        // Både bruker- og avsenderkortet har navnet til personen som tilgjengelig navn.
        const brukerOgAvsender = page.getByRole('region', { name: 'Søker Testersen' });
        await expect(brukerOgAvsender.filter({ hasText: 'Søker/Bruker' })).toContainText(
            'Søker Testersen | 123456 78910'
        );
        await expect(brukerOgAvsender.filter({ hasText: 'Avsender' })).toContainText('Søker Testersen | 123456 78910');

        await dokumentRequest;
        await expect(page.locator('iframe[title="dokument"]')).toBeVisible();
    });

    test('skal journalføre og opprette førstegangsbehandling', async ({ page, apiMock }) => {
        apiMock.use(http.post(JOURNALFØR_URL, () => HttpResponse.json(byggSuksessRessurs('1'))));

        await page.goto('/oppgaver/journalfor/1');

        await page.getByRole('checkbox', { name: 'Knytt til ny behandling' }).check();
        await page.getByRole('combobox', { name: 'Velg type behandling' }).selectOption('Førstegangsbehandling');
        await page.getByRole('combobox', { name: 'Velg behandlingstema' }).selectOption('Nasjonal');

        const journalførRequest = page.waitForRequest(
            request => request.method() === 'POST' && request.url().endsWith(encodeURI('/journalpost/1/journalfør/1'))
        );
        await page.getByRole('button', { name: 'Journalfør' }).click();

        expect((await journalførRequest).postDataJSON()).toEqual({
            journalpostTittel: 'Søknad om kontantstøtte',
            kategori: 'NASJONAL',
            bruker: { navn: 'Søker Testersen', id: '12345678910' },
            avsender: { navn: 'Søker Testersen', id: '12345678910' },
            datoMottatt: '2026-10-01T08:00:00',
            dokumenter: [
                {
                    dokumentTittel: 'Søknad om kontantstøtte',
                    dokumentInfoId: '1',
                    eksisterendeLogiskeVedlegg: [],
                    logiskeVedlegg: [],
                },
            ],
            tilknyttedeBehandlinger: [],
            opprettOgKnyttTilNyBehandling: true,
            nyBehandlingstype: 'FØRSTEGANGSBEHANDLING',
            nyBehandlingsårsak: 'SØKNAD',
            navIdent: 'A1',
            journalførendeEnhet: '0001',
        });

        await expect(page).toHaveURL(/\/fagsak\/1\/saksoversikt$/);
    });

    test('skal vise valideringsfeil når påkrevde felter mangler', async ({ page, apiMock }) => {
        apiMock.use(
            http.get(OPPGAVE_URL, () =>
                HttpResponse.json(
                    byggSuksessRessurs(
                        JournalpostTestdata.lagDataForManuellJournalføring({
                            journalpost: JournalpostTestdata.lagJournalpost({ avsenderMottaker: undefined }),
                        })
                    )
                )
            )
        );

        await page.goto('/oppgaver/journalfor/1');

        await page.getByRole('checkbox', { name: 'Knytt til ny behandling' }).check();
        await page.getByRole('button', { name: 'Journalfør' }).click();

        await expect(page.getByRole('heading', { name: 'For å gå videre må du rette opp følgende' })).toBeVisible();
        await expect(
            page.getByRole('link', { name: 'Velg type behandling som skal opprettes fra nedtrekkslisten' })
        ).toBeVisible();
        await expect(page.getByRole('link', { name: 'Behandlingstema må settes.' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Avsenders navn er ikke satt' })).toBeVisible();
        await expect(page.getByRole('region', { name: 'Ukjent avsender' })).toContainText('Ukjent avsender');
    });
});
