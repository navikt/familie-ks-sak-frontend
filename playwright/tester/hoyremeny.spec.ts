import type { HistorikkinnslagDto } from '@api/hentHistorikkinnslag';
import { byggSuksessRessurs } from '@navikt/familie-typer';
import { TOM_PDF_BASE64 } from '@testutils/mocks/handlers/dokumentHandlers';
import { BehandlingSteg } from '@typer/behandling';
import { LoggType } from '@typer/logg';
import { HttpResponse, http } from 'msw';

import type { ApiMock } from '../apiMock';
import { lagBehandlingPåSteg, SØKER_IDENT } from '../behandlingsdata';
import { lagBehandlingsmock } from '../behandlingsmock';
import { expect, test } from '../fixtures';

const VILKÅRSVURDERING_URL = '/fagsak/1/1/vilkaarsvurdering';
const HISTORIKK_URL = '/familie-ks-sak/api/logg/:behandlingId';

function lagHistorikkinnslag(historikkinnslag: Partial<HistorikkinnslagDto>): HistorikkinnslagDto {
    return {
        id: 1,
        opprettetAv: 'Sak Behandler',
        opprettetTidspunkt: '2026-10-01T09:15:00.000',
        behandlingId: 1,
        type: LoggType.BEHANDLING_OPPRETTET,
        tittel: 'Behandling opprettet',
        rolle: 'SAKSBEHANDLER',
        tekst: '',
        ...historikkinnslag,
    };
}

function mockBehandling(apiMock: ApiMock) {
    apiMock.use(...lagBehandlingsmock(lagBehandlingPåSteg(BehandlingSteg.VILKÅRSVURDERING)).handlers);
}

test.describe('Høyremenyen', () => {
    test('skal vise historikken for behandlingen', async ({ page, apiMock }) => {
        mockBehandling(apiMock);
        apiMock.use(
            http.get(HISTORIKK_URL, () =>
                HttpResponse.json(
                    byggSuksessRessurs([
                        lagHistorikkinnslag({
                            id: 2,
                            opprettetAv: 'System',
                            opprettetTidspunkt: '2026-10-01T09:16:00.000',
                            type: LoggType.SØKNAD_REGISTRERT,
                            tittel: 'Søknaden ble registrert',
                            rolle: 'SYSTEM',
                            tekst: 'Søknad om kontantstøtte',
                        }),
                        lagHistorikkinnslag({}),
                    ])
                )
            )
        );

        await page.goto(VILKÅRSVURDERING_URL);

        await expect(page.getByRole('tab', { name: 'Historikk' })).toHaveAttribute('aria-selected', 'true');
        const historikk = page.getByRole('tabpanel', { name: 'Historikk' }).getByRole('listitem');
        await expect(historikk).toHaveCount(2);
        await expect(historikk.nth(0)).toContainText('Søknaden ble registrert');
        await expect(historikk.nth(0)).toContainText('Søknad om kontantstøtte');
        await expect(historikk.nth(0)).toContainText('01.10.26 09:16');
        await expect(historikk.nth(1)).toContainText('Behandling opprettet');
        await expect(historikk.nth(1)).toContainText('Sak Behandler (Saksbehandler)');
    });

    test('skal forhåndsvise og sende brev fra behandlingen', async ({ page, apiMock }) => {
        const behandlingsmock = lagBehandlingsmock(lagBehandlingPåSteg(BehandlingSteg.VILKÅRSVURDERING));
        apiMock.use(
            http.post('/familie-ks-sak/api/brev/forhaandsvis-brev/:behandlingId', () =>
                HttpResponse.json(byggSuksessRessurs(TOM_PDF_BASE64))
            ),
            http.post('/familie-ks-sak/api/brev/send-brev/:behandlingId', () =>
                HttpResponse.json(byggSuksessRessurs(behandlingsmock.hent()))
            ),
            ...behandlingsmock.handlers
        );

        await page.goto(VILKÅRSVURDERING_URL);
        await page.getByRole('tab', { name: 'Send brev' }).click();

        const brevskjema = page.getByRole('tabpanel', { name: 'Send brev' });
        await brevskjema.getByRole('button', { name: 'Send brev' }).click();
        await expect(brevskjema.getByText('Du må velge en mottaker')).toBeVisible();
        await expect(brevskjema.getByText('Du må velge en brevmal')).toBeVisible();

        await brevskjema.getByLabel('Velg mottaker').selectOption(SØKER_IDENT);
        await brevskjema.getByLabel('Velg brevmal').selectOption({ label: 'Innhent opplysninger' });
        await brevskjema.getByRole('combobox', { name: /Velg dokumenter/ }).click();
        await page.getByRole('option', { name: 'Barnehageplass - barnet' }).click();
        await page.keyboard.press('Escape');
        await brevskjema.getByRole('button', { name: 'Legg til kulepunkt' }).click();
        await brevskjema.getByRole('textbox', { name: 'Skriv inn kulepunkt' }).fill('Kopi av barnehageavtalen');

        const forhåndsvisRequest = page.waitForRequest(request =>
            request.url().endsWith('/familie-ks-sak/api/brev/forhaandsvis-brev/1')
        );
        await brevskjema.getByRole('button', { name: 'Forhåndsvis' }).click();
        expect((await forhåndsvisRequest).postDataJSON()).toMatchObject({
            mottakerIdent: SØKER_IDENT,
            brevmal: 'INNHENTE_OPPLYSNINGER',
        });

        const forhåndsvisning = page.getByRole('dialog', { name: 'Forhåndsvisning av brev' });
        await expect(forhåndsvisning.locator('iframe[title="Dokument"]')).toBeVisible();
        await forhåndsvisning.getByRole('button', { name: 'Lukk' }).click();
        await expect(forhåndsvisning).toBeHidden();

        const sendBrevRequest = page.waitForRequest(request =>
            request.url().endsWith('/familie-ks-sak/api/brev/send-brev/1')
        );
        await brevskjema.getByRole('button', { name: 'Send brev' }).click();

        const payload = (await sendBrevRequest).postDataJSON();
        expect(payload).toMatchObject({
            mottakerIdent: SØKER_IDENT,
            brevmal: 'INNHENTE_OPPLYSNINGER',
            behandlingKategori: 'NASJONAL',
            antallUkerSvarfrist: 3,
        });
        expect(payload.multiselectVerdier).toHaveLength(2);
        expect(payload.multiselectVerdier).toContain('Kopi av barnehageavtalen');

        const sendt = page.getByRole('dialog', { name: 'Brevet er sendt' });
        await expect(sendt.getByRole('button', { name: 'Se saksoversikt' })).toBeVisible();
        await sendt.getByRole('button', { name: 'Lukk' }).click();

        await expect(page.getByRole('tab', { name: 'Historikk' })).toHaveAttribute('aria-selected', 'true');
    });
});
