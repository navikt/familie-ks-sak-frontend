import { BehandlingStatus, BehandlingSteg } from '@typer/behandling';

import { lagBehandlingPåSteg, lagVedtaksperiodemock } from '../behandlingsdata';
import { lagBehandlingsmock } from '../behandlingsmock';
import { expect, test } from '../fixtures';

const FORHÅNDSVIS_OG_LAGRE_VEDTAKSBREV_URL = '/familie-ks-sak/api/brev/forhaandsvis-og-lagre-vedtaksbrev/1';
const VEDTAKSPERIODE = 'Begrunnelse - Periode 2025-03-01_2025-09-30';

test.describe('Vedtak', () => {
    test('skal kreve en begrunnelse før vedtaket kan sendes til godkjenning', async ({ page, apiMock }) => {
        const behandlingsmock = lagBehandlingsmock(lagBehandlingPåSteg(BehandlingSteg.VEDTAK));
        apiMock.use(...behandlingsmock.handlers, ...lagVedtaksperiodemock().handlers);

        const foreslåVedtakKall: string[] = [];
        page.on('request', request => {
            if (request.url().includes(encodeURI('/steg/foreslå-vedtak'))) {
                foreslåVedtakKall.push(request.url());
            }
        });

        await page.goto('/fagsak/1/1/vedtak');
        await expect(page.getByRole('heading', { name: 'Vedtak', level: 1 })).toBeVisible();
        await expect(page.getByRole('region', { name: VEDTAKSPERIODE })).toBeVisible();

        await page.getByRole('button', { name: 'Til godkjenning' }).click();

        // Appen viser bare en feilmelding under knappene, uten dialog eller navigering.
        await expect(
            page.getByText('Vedtaksbrevet mangler begrunnelse. Du må legge til minst én begrunnelse.')
        ).toBeVisible();
        await expect(page.getByRole('dialog', { name: 'Totrinnskontroll' })).toBeHidden();
        expect(foreslåVedtakKall).toEqual([]);
        expect(behandlingsmock.hent().status).toBe(BehandlingStatus.UTREDES);
    });

    test('skal forhåndsvise vedtaksbrevet', async ({ page, apiMock }) => {
        apiMock.use(
            ...lagBehandlingsmock(lagBehandlingPåSteg(BehandlingSteg.VEDTAK)).handlers,
            ...lagVedtaksperiodemock().handlers
        );

        await page.goto('/fagsak/1/1/vedtak');

        // Saksbehandler på vedtakssteget lagrer brevet samtidig som det forhåndsvises.
        const brevRequest = page.waitForRequest(`**${FORHÅNDSVIS_OG_LAGRE_VEDTAKSBREV_URL}`);
        await page.getByRole('button', { name: 'Vis vedtaksbrev' }).click();

        expect((await brevRequest).method()).toBe('POST');
        const forhåndsvisning = page.getByRole('dialog', { name: 'Forhåndsvis vedtaksbrev' });
        await expect(forhåndsvisning.locator('iframe[title="Vedtaksbrev"]')).toBeVisible();
    });
});
