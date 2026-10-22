import { byggFeiletRessurs, RessursStatus } from '@navikt/familie-typer';
import { HttpResponse, http } from 'msw';

import { expect, test } from '../fixtures';

const FAGSAK_URL = '/familie-ks-sak/api/fagsaker/minimal/:fagsakId';
const BEHANDLING_URL = '/familie-ks-sak/api/behandlinger/:behandlingId';

test.describe('Feilhåndtering', () => {
    test('skal vise at saksbehandler mangler tilgang til behandlingen', async ({ page, apiMock }) => {
        apiMock.use(
            http.get(BEHANDLING_URL, () =>
                HttpResponse.json(
                    { status: RessursStatus.IKKE_TILGANG, melding: 'Mangler tilgang', frontendFeilmelding: '' },
                    { status: 403 }
                )
            )
        );

        await page.goto('/fagsak/1/1/registrer-soknad');

        await expect(
            page.getByRole('heading', { name: 'Du har ikke tilgang til å se denne behandlingen.' })
        ).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Registrer opplysninger fra søknaden' })).toBeHidden();
    });

    test('skal be saksbehandler laste siden på nytt når sesjonen er utløpt', async ({ page, apiMock }) => {
        apiMock.use(http.get(FAGSAK_URL, () => new HttpResponse(null, { status: 401 })));

        await page.goto('/fagsak/1/saksoversikt');

        const sesjonUtløpt = page.getByRole('dialog', { name: 'Ugyldig sesjon' });
        await expect(sesjonUtløpt).toBeVisible();
        await expect(sesjonUtløpt).toContainText('Prøv å last siden inn på nytt.');
    });

    test('skal vise feilmelding med callId når backend svarer med feil', async ({ page, apiMock }) => {
        apiMock.use(
            http.get(FAGSAK_URL, () =>
                HttpResponse.json({ ...byggFeiletRessurs('Noe gikk galt i backend.'), callId: 'abc-123' })
            )
        );

        await page.goto('/fagsak/1/saksoversikt');

        await expect(page.getByRole('alert')).toContainText('Noe gikk galt i backend. (CallId: abc-123)');
    });
});
