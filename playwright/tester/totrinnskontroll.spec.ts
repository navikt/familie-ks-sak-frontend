import { BehandlingStatus, BehandlingSteg } from '@typer/behandling';
import { type ITotrinnskontroll, TotrinnskontrollBeslutning } from '@typer/totrinnskontroll';

import { innloggetSomBeslutter, lagBehandlingPåSteg, lagVedtaksperiodemock } from '../behandlingsdata';
import { lagBehandlingsmock } from '../behandlingsmock';
import { expect, test } from '../fixtures';
import { KONTROLLSIDER, kontrollerAlleSider } from '../kontrollsider';

const BESLUTT_VEDTAK_URL = encodeURI('/familie-ks-sak/api/behandlinger/1/steg/beslutt-vedtak');
const KONTROLLERTE_SIDER = KONTROLLSIDER.map(side => side.navn);

function lagBehandlingSendtTilBeslutter(totrinnskontroll: Partial<ITotrinnskontroll> = {}) {
    return lagBehandlingPåSteg(BehandlingSteg.BESLUTTE_VEDTAK, {
        status: BehandlingStatus.FATTER_VEDTAK,
        totrinnskontroll: {
            saksbehandler: 'Sak Behandler',
            saksbehandlerId: 'A1',
            godkjent: false,
            opprettetTidspunkt: '2026-10-01T10:00:00.000',
            ...totrinnskontroll,
        },
    });
}

test.describe('Totrinnskontroll', () => {
    test('skal kreve at beslutter kontrollerer alle sider før vedtaket godkjennes', async ({ page, apiMock }) => {
        const behandlingsmock = lagBehandlingsmock(lagBehandlingSendtTilBeslutter());
        apiMock.use(innloggetSomBeslutter, ...behandlingsmock.handlers, ...lagVedtaksperiodemock().handlers);

        await page.goto('/fagsak/1/1/vedtak');

        const totrinnskontroll = page
            .locator('form')
            .filter({ has: page.getByRole('heading', { name: 'Totrinnskontroll' }) });
        await expect(
            totrinnskontroll.getByText('Kontrollér opplysninger og faglige vurderinger som er gjort')
        ).toBeVisible();
        for (const [index, side] of KONTROLLERTE_SIDER.entries()) {
            await expect(totrinnskontroll.getByText(`${index + 1}. ${side}`, { exact: true })).toBeVisible();
        }

        await totrinnskontroll.getByRole('radio', { name: 'Godkjent' }).check();
        await totrinnskontroll.getByRole('button', { name: 'Godkjenn vedtaket' }).click();
        await expect(totrinnskontroll.getByText('Du må kontrollere alle steg i løsningen.')).toBeVisible();

        await kontrollerAlleSider(page);
        await expect(totrinnskontroll.getByText('Du må kontrollere alle steg i løsningen.')).toBeHidden();

        const besluttRequest = page.waitForRequest(request => request.url().endsWith(BESLUTT_VEDTAK_URL));
        await totrinnskontroll.getByRole('button', { name: 'Godkjenn vedtaket' }).click();

        expect((await besluttRequest).postDataJSON()).toEqual({
            beslutning: TotrinnskontrollBeslutning.GODKJENT,
            begrunnelse: '',
            kontrollerteSider: KONTROLLERTE_SIDER,
        });
        const kvittering = page.getByRole('dialog', { name: 'Totrinnskontroll' });
        await expect(kvittering.getByText('Behandlingen er godkjent, og vedtaket er iverksatt.')).toBeVisible();
        expect(behandlingsmock.hent().status).toBe(BehandlingStatus.IVERKSETTER_VEDTAK);

        await kvittering.getByRole('button', { name: 'Gå til oppgavebenken' }).click();
        await expect(page).toHaveURL(/\/oppgaver$/);
    });

    test('skal kreve begrunnelse når beslutter sender vedtaket tilbake til saksbehandler', async ({
        page,
        apiMock,
    }) => {
        const behandlingsmock = lagBehandlingsmock(lagBehandlingSendtTilBeslutter());
        apiMock.use(innloggetSomBeslutter, ...behandlingsmock.handlers, ...lagVedtaksperiodemock().handlers);

        await page.goto('/fagsak/1/1/vedtak');
        await kontrollerAlleSider(page);

        const totrinnskontroll = page
            .locator('form')
            .filter({ has: page.getByRole('heading', { name: 'Totrinnskontroll' }) });
        await totrinnskontroll.getByRole('radio', { name: 'Vurdér på nytt' }).check();
        await totrinnskontroll.getByRole('button', { name: 'Send til saksbehandler' }).click();
        await expect(totrinnskontroll.getByText('Du må fylle ut en begrunnelse.')).toBeVisible();

        const begrunnelse = 'Barnehageplassen må vurderes på nytt.';
        await totrinnskontroll.getByLabel('Begrunnelse').fill(begrunnelse);

        const besluttRequest = page.waitForRequest(request => request.url().endsWith(BESLUTT_VEDTAK_URL));
        await totrinnskontroll.getByRole('button', { name: 'Send til saksbehandler' }).click();

        expect((await besluttRequest).postDataJSON()).toEqual({
            beslutning: TotrinnskontrollBeslutning.UNDERKJENT,
            begrunnelse,
            kontrollerteSider: KONTROLLERTE_SIDER,
        });
        const kvittering = page.getByRole('dialog', { name: 'Totrinnskontroll' });
        await expect(
            kvittering.getByText('Behandlingen er ikke godkjent og er sendt tilbake til saksbehandler.')
        ).toBeVisible();
        expect(behandlingsmock.hent().status).toBe(BehandlingStatus.UTREDES);
        expect(behandlingsmock.hent().steg).toBe(BehandlingSteg.VEDTAK);
    });
});
