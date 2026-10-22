import { BehandlingSteg } from '@typer/behandling';

import { lagBehandlingPåSteg } from '../behandlingsdata';
import { lagBehandlingsmock } from '../behandlingsmock';
import { expect, test } from '../fixtures';

const SAKSOVERSIKT_URL = /\/fagsak\/1\/saksoversikt$/;
const DOKUMENTER_URL = /\/fagsak\/1\/dokumenter$/;
const VILKÅRSVURDERING_URL = /\/fagsak\/1\/1\/vilkaarsvurdering$/;

test.describe('Navigasjon', () => {
    test('skal vise feilside for ukjent adresse og kunne gå tilbake til forsiden', async ({ page }) => {
        await page.goto('/finnes-ikke');

        await expect(page.getByRole('heading', { name: 'Beklager, vi fant ikke siden' })).toBeVisible();

        await page.getByRole('button', { name: 'Gå til forsiden' }).click();

        await expect(page).toHaveURL(/\/oppgaver$/);
        await expect(page.getByRole('heading', { name: 'Oppgavebenken' })).toBeVisible();
    });

    test('skal sende fagsaken til saksoversikten og kunne navigere mellom sidene i fagsaken', async ({ page }) => {
        await page.goto('/fagsak/1');

        await expect(page).toHaveURL(SAKSOVERSIKT_URL);
        await expect(page.getByRole('heading', { name: 'Saksoversikt', level: 1 })).toBeVisible();

        await page.getByRole('button', { name: 'Dokumenter' }).click();
        await expect(page).toHaveURL(DOKUMENTER_URL);
        await expect(page.getByRole('heading', { name: 'Dokumentoversikt' })).toBeVisible();

        await page.getByRole('button', { name: 'Saksoversikt' }).click();
        await expect(page).toHaveURL(SAKSOVERSIKT_URL);
        await expect(page.getByRole('heading', { name: 'Saksoversikt', level: 1 })).toBeVisible();
    });

    test('skal ikke kunne åpne steg i venstremenyen som behandlingen ikke har nådd', async ({ page, apiMock }) => {
        apiMock.use(...lagBehandlingsmock(lagBehandlingPåSteg(BehandlingSteg.VILKÅRSVURDERING)).handlers);

        await page.goto('/fagsak/1/1/vilkaarsvurdering');
        await expect(page.getByRole('heading', { name: 'Vilkårsvurdering', level: 1 })).toBeVisible();

        const venstremeny = page.getByRole('navigation').filter({ hasText: '1. Registrer søknad' });

        // Steg som ikke er nådd kan ikke klikkes med mus, og navigering med tastatur stoppes i onClick.
        const simulering = venstremeny.getByRole('link', { name: '4. Simulering' });
        await expect(simulering).toHaveCSS('pointer-events', 'none');
        await simulering.press('Enter');
        await expect(page).toHaveURL(VILKÅRSVURDERING_URL);
        await expect(page.getByRole('heading', { name: 'Vilkårsvurdering', level: 1 })).toBeVisible();

        await venstremeny.getByRole('link', { name: '1. Registrer søknad' }).click();
        await expect(page).toHaveURL(/\/fagsak\/1\/1\/registrer-soknad$/);
        await expect(page.getByRole('heading', { name: 'Registrer opplysninger fra søknaden' })).toBeVisible();
    });
});
