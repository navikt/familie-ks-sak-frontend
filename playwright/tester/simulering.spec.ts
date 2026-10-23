import { byggSuksessRessurs } from '@navikt/familie-typer';
import { FagsakTestdata } from '@testutils/testdata/fagsakTestdata';
import { SimuleringTestdata } from '@testutils/testdata/simuleringTestdata';
import { BehandlingSteg } from '@typer/behandling';
import { type ISimuleringDTO, Tilbakekrevingsvalg } from '@typer/simulering';
import { HttpResponse, http } from 'msw';

import { KONTANTSTØTTE_SATS, lagBehandlingPåSteg, SØKER_IDENT } from '../behandlingsdata';
import { lagBehandlingsmock } from '../behandlingsmock';
import { expect, test } from '../fixtures';

const SIMULERING_STEG_URL = encodeURI('/familie-ks-sak/api/behandlinger/1/steg/simulering');

function lagSimuleringMock() {
    return lagBehandlingsmock(lagBehandlingPåSteg(BehandlingSteg.SIMULERING), {
        fagsak: FagsakTestdata.lagFagsak({ søkerFødselsnummer: SØKER_IDENT }),
    });
}

function mockSimulering(simulering: ISimuleringDTO) {
    return http.get('/familie-ks-sak/api/behandlinger/:behandlingId/simulering', () =>
        HttpResponse.json(byggSuksessRessurs(simulering))
    );
}

/** Barnet har fått utbetalt kontantstøtte i august og september 2025 som det ikke hadde rett på. */
const simuleringMedFeilutbetaling = SimuleringTestdata.lagSimulering({
    fom: '2025-08-01',
    feilutbetaling: 2 * KONTANTSTØTTE_SATS,
    tomSisteUtbetaling: '2025-09-30',
    perioder: ['2025-08', '2025-09'].map(måned =>
        SimuleringTestdata.lagSimuleringPeriode({
            fom: `${måned}-01`,
            tom: `${måned}-30`,
            forfallsdato: `${måned}-20`,
            nyttBeløp: 0,
            tidligereUtbetalt: KONTANTSTØTTE_SATS,
            resultat: -KONTANTSTØTTE_SATS,
            feilutbetaling: KONTANTSTØTTE_SATS,
        })
    ),
});

/** Kontantstøtte for august 2025 etterbetales, og september 2025 er neste utbetaling. */
const simuleringMedEtterbetaling = SimuleringTestdata.lagSimulering({
    fom: '2025-08-01',
    etterbetaling: KONTANTSTØTTE_SATS,
    fomDatoNestePeriode: '2025-09-01',
    tomDatoNestePeriode: '2025-09-30',
    tomSisteUtbetaling: '2025-09-30',
    perioder: ['2025-08', '2025-09'].map(måned =>
        SimuleringTestdata.lagSimuleringPeriode({
            fom: `${måned}-01`,
            tom: `${måned}-30`,
            forfallsdato: `${måned}-20`,
            nyttBeløp: KONTANTSTØTTE_SATS,
            tidligereUtbetalt: 0,
            resultat: KONTANTSTØTTE_SATS,
            etterbetaling: måned === '2025-08' ? KONTANTSTØTTE_SATS : 0,
        })
    ),
});

test.describe('Simulering', () => {
    test('skal kreve valg om tilbakekreving ved feilutbetaling og sende valget med steget', async ({
        page,
        apiMock,
    }) => {
        apiMock.use(...lagSimuleringMock().handlers, mockSimulering(simuleringMedFeilutbetaling));

        await page.goto('/fagsak/1/1/simulering');
        const oversikt = page.getByLabel('Simuleringsoversikt');
        await expect(oversikt.getByText(/^15\s000 kr$/)).toBeVisible();
        const tilbakekreving = page.getByRole('group', { name: 'Tilbakekreving' });
        await expect(tilbakekreving).toBeVisible();

        await page.getByRole('button', { name: 'Neste steg' }).click();

        await expect(
            tilbakekreving.getByRole('heading', { name: 'For å gå videre må du rette opp følgende:' })
        ).toBeVisible();
        const måVelgeTilbakekreving =
            'Resultatet medfører en feilutbetaling. Du må velge om det skal opprettes tilbakekrevingsbehandling.';
        await expect(tilbakekreving.getByRole('link', { name: måVelgeTilbakekreving })).toBeVisible();
        await expect(
            tilbakekreving.getByRole('link', { name: 'Du må skrive en begrunnelse for valget om tilbakekreving.' })
        ).toBeVisible();
        await expect(page).toHaveURL('/fagsak/1/1/simulering');

        // Varsel krever fritekst. Uten varsel trengs bare begrunnelsen.
        await tilbakekreving.getByRole('radio', { name: 'Opprett tilbakekreving, send varsel' }).check();
        await expect(tilbakekreving.getByRole('textbox', { name: /^Fritekst i varselet/ })).toBeVisible();
        await tilbakekreving.getByRole('radio', { name: 'Opprett tilbakekreving, ikke send varsel' }).check();
        await expect(tilbakekreving.getByRole('textbox', { name: /^Fritekst i varselet/ })).toHaveCount(0);
        await tilbakekreving
            .getByRole('textbox', { name: /^Årsak til feilutbetaling og videre behandling/ })
            .fill('Barnet har hatt fulltidsplass i barnehage siden august.');

        const stegRequest = page.waitForRequest(
            request => request.method() === 'POST' && new URL(request.url()).pathname === SIMULERING_STEG_URL
        );
        await page.getByRole('button', { name: 'Neste steg' }).click();

        expect((await stegRequest).postDataJSON()).toEqual({
            vedtakId: 1,
            valg: Tilbakekrevingsvalg.OPPRETT_TILBAKEKREVING_UTEN_VARSEL,
            begrunnelse: 'Barnet har hatt fulltidsplass i barnehage siden august.',
        });
        await expect(page).toHaveURL('/fagsak/1/1/vedtak');
    });

    test('skal vise etterbetaling og neste utbetaling uten å spørre om tilbakekreving', async ({ page, apiMock }) => {
        apiMock.use(...lagSimuleringMock().handlers, mockSimulering(simuleringMedEtterbetaling));

        await page.goto('/fagsak/1/1/simulering');

        const oversikt = page.getByLabel('Simuleringsoversikt');
        await expect(oversikt.getByText('Feilutbetaling')).toBeVisible();
        await expect(oversikt.getByText('Etterbetaling')).toBeVisible();
        await expect(oversikt.getByText('Neste utbetaling')).toBeVisible();
        await expect(oversikt.getByText('September 2025')).toBeVisible();
        // Etterbetalingen for august og neste utbetaling i september er like store.
        await expect(oversikt.getByText(/^7\s500 kr$/)).toHaveCount(2);
        await expect(page.getByRole('table', { name: /^Simuleringsresultat for/ })).toBeVisible();
        await expect(page.getByRole('group', { name: 'Tilbakekreving' })).toHaveCount(0);

        const stegRequest = page.waitForRequest(
            request => request.method() === 'POST' && new URL(request.url()).pathname === SIMULERING_STEG_URL
        );
        await page.getByRole('button', { name: 'Neste steg' }).click();

        expect((await stegRequest).postData()).toBeFalsy();
        await expect(page).toHaveURL('/fagsak/1/1/vedtak');
    });
});
