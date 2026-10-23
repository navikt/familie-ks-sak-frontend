import { BehandlingSteg } from '@typer/behandling';

import { innloggetSomVeileder, lagBehandlingPåSteg } from '../behandlingsdata';
import { lagBehandlingsmock } from '../behandlingsmock';
import { expect, test } from '../fixtures';

// Navnet personhandleren gir søkeren på fagsaken, og navnet appen viser i stedet når persondata obfuskeres.
const BRUKERENS_NAVN = 'Test Testersen';
const OBFUSKERT_NAVN = 'Søker Søkersen';

test.describe('Lesetilgang', () => {
    test('skal skjule menyene og knappene som endrer behandlingen for veileder', async ({ page, apiMock }) => {
        apiMock.use(
            innloggetSomVeileder,
            ...lagBehandlingsmock(lagBehandlingPåSteg(BehandlingSteg.VILKÅRSVURDERING)).handlers
        );

        await page.goto('/fagsak/1/1/vilkaarsvurdering');

        await expect(page.getByRole('heading', { name: 'Vilkårsvurdering', level: 1 })).toBeVisible();
        await expect(page.getByRole('tab', { name: 'Historikk' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Meny', exact: true })).toBeHidden();
        await expect(page.getByRole('tab', { name: 'Send brev' })).toBeHidden();
        await expect(page.getByRole('button', { name: 'Neste steg' })).toBeHidden();
    });

    test('skal skjule fagsakmenyen for veileder', async ({ page, apiMock }) => {
        apiMock.use(innloggetSomVeileder);

        await page.goto('/fagsak/1/saksoversikt');

        await expect(page.getByRole('heading', { name: 'Saksoversikt', level: 1 })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Dokumenter' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Meny', exact: true })).toBeHidden();

        await page.goto('/fagsak/1/dokumenter');

        await expect(page.getByRole('heading', { name: 'Dokumentoversikt' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Saksoversikt' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Meny', exact: true })).toBeHidden();
    });
});

test.describe('Obfuskering av persondata', () => {
    test('skal skjule navnet til brukeren for veileder når obfuskering er skrudd på', async ({ page, apiMock }) => {
        apiMock.use(innloggetSomVeileder);

        await page.goto('/fagsak/1/saksoversikt');

        await expect(page.getByRole('heading', { name: 'Saksoversikt', level: 1 })).toBeVisible();
        await expect(page.getByText(OBFUSKERT_NAVN, { exact: false }).first()).toBeVisible();
        await expect(page.getByText(BRUKERENS_NAVN, { exact: false })).toHaveCount(0);
        // Fødselsnummeret obfuskeres ikke.
        await expect(page.getByText('123456 78903').first()).toBeVisible();
    });
});
