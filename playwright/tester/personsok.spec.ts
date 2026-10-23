import { byggSuksessRessurs } from '@navikt/familie-typer';
import { FagsakDeltagerTestdata } from '@testutils/testdata/fagsakDeltagerTestdata';
import { FagsakTestdata } from '@testutils/testdata/fagsakTestdata';
import generator from '@testutils/testverktøy/fnr/fnr-generator';
import { HttpResponse, http } from 'msw';

import { expect, test } from '../fixtures';

const SØK_URL = '/familie-ks-sak/api/fagsaker/sok';
const SØKEFELT = 'Fødsels- eller D-nummer (11 siffer)';

const gyldigFnr = generator(new Date('1990-05-17')).next().value as string;

test.describe('Personsøk', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/oppgaver');
        await expect(page.getByRole('heading', { name: 'Oppgavebenken' })).toBeVisible();
    });

    test('skal vise valideringsfeil og ikke søke ved ugyldig fødselsnummer', async ({ page }) => {
        const søkekall: string[] = [];
        page.on('request', request => {
            if (request.url().endsWith(SØK_URL)) {
                søkekall.push(request.url());
            }
        });

        await page.getByRole('searchbox', { name: SØKEFELT }).fill('12345678900');
        await page.getByRole('searchbox', { name: SØKEFELT }).press('Enter');

        await expect(page.getByText('Ugyldig fødsels- eller d-nummer (11 siffer)')).toBeVisible();
        expect(søkekall).toEqual([]);
    });

    test('skal navigere til saksoversikten når et treff med fagsak velges', async ({ page, apiMock }) => {
        apiMock.use(
            http.post(SØK_URL, () =>
                HttpResponse.json(
                    byggSuksessRessurs([
                        FagsakDeltagerTestdata.lagFagsakDeltager({
                            ident: gyldigFnr,
                            navn: 'Søker Søkersen',
                            fagsakId: 42,
                        }),
                    ])
                )
            )
        );

        const søkRequest = page.waitForRequest(`**${SØK_URL}`);
        await page.getByRole('searchbox', { name: SØKEFELT }).fill(gyldigFnr);
        expect((await søkRequest).postDataJSON()).toEqual({ personIdent: gyldigFnr });

        await page.getByRole('option', { name: 'Søker Søkersen' }).click();

        await expect(page).toHaveURL(/\/fagsak\/42\/saksoversikt$/);
        await expect(page.getByRole('heading', { name: 'Saksoversikt', level: 1 })).toBeVisible();
    });

    test('skal kunne opprette fagsak når treffet ikke har fagsak', async ({ page, apiMock }) => {
        apiMock.use(
            http.post(SØK_URL, () =>
                HttpResponse.json(
                    byggSuksessRessurs([
                        FagsakDeltagerTestdata.lagFagsakDeltager({
                            ident: gyldigFnr,
                            navn: 'Søker Søkersen',
                            fagsakId: undefined,
                        }),
                    ])
                )
            ),
            http.post('/familie-ks-sak/api/fagsaker', () =>
                HttpResponse.json(
                    byggSuksessRessurs(
                        FagsakTestdata.lagFagsak({ id: 2, søkerFødselsnummer: gyldigFnr, behandlinger: [] })
                    )
                )
            )
        );

        await page.getByRole('searchbox', { name: SØKEFELT }).fill(gyldigFnr);
        await page.getByRole('option', { name: 'Søker Søkersen' }).click();

        const modal = page.getByRole('dialog', { name: 'Opprett fagsak' });
        await expect(modal.getByText('Ønsker du å opprette fagsak for denne personen?')).toBeVisible();

        const opprettRequest = page.waitForRequest(
            request => request.method() === 'POST' && request.url().endsWith('/familie-ks-sak/api/fagsaker')
        );
        await modal.getByRole('button', { name: 'Opprett fagsak' }).click();

        expect((await opprettRequest).postDataJSON()).toEqual({ personIdent: gyldigFnr });
        await expect(modal).toBeHidden();
        await expect(page).toHaveURL(/\/fagsak\/2\/saksoversikt$/);
        await expect(page.getByRole('heading', { name: 'Saksoversikt', level: 1 })).toBeVisible();
    });
});
