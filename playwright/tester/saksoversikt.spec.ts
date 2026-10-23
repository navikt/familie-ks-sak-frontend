import { byggSuksessRessurs } from '@navikt/familie-typer';
import { lagVisningBehandling } from '@testutils/testdata/behandlingTestdata';
import { FagsakTestdata } from '@testutils/testdata/fagsakTestdata';
import { VedtaksperiodeTestdata } from '@testutils/testdata/vedtaksperiodeTestdata';
import { FagsakStatus } from '@typer/fagsak';
import { HttpResponse, http } from 'msw';

import { BARN_NAVN, KONTANTSTØTTE_SATS, lagPersoner } from '../behandlingsdata';
import { expect, test } from '../fixtures';

const FAGSAK_URL = '/familie-ks-sak/api/fagsaker/minimal/:fagsakId';

test.describe('Saksoversikt', () => {
    test('skal vise løpende utbetaling og behandlinger for fagsaken', async ({ page, apiMock }) => {
        apiMock.use(
            http.get(FAGSAK_URL, () =>
                HttpResponse.json(
                    byggSuksessRessurs(
                        FagsakTestdata.lagFagsak({
                            status: FagsakStatus.LØPENDE,
                            behandlinger: [lagVisningBehandling()],
                            // Perioden har ingen sluttdato, så den gjelder både denne og neste måned.
                            gjeldendeUtbetalingsperioder: [
                                VedtaksperiodeTestdata.lagUtbetalingsperiode({
                                    periodeFom: '2025-01-01',
                                    periodeTom: undefined,
                                    utbetalingsperiodeDetaljer: [
                                        VedtaksperiodeTestdata.lagUtbetalingsperiodeDetalj({
                                            person: lagPersoner()[1],
                                            utbetaltPerMnd: KONTANTSTØTTE_SATS,
                                        }),
                                    ],
                                }),
                            ],
                        })
                    )
                )
            )
        );

        await page.goto('/fagsak/1/saksoversikt');

        await expect(page.getByRole('heading', { name: 'Saksoversikt', level: 1 })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Gå til gjeldende vedtak' })).toBeVisible();

        await expect(page.getByRole('heading', { name: 'Løpende månedlig utbetaling' })).toBeVisible();
        await expect(page.getByText(new RegExp(`^${BARN_NAVN} \\(\\d+ år\\)$`))).toBeVisible();
        await expect(page.getByText('Totalt utbetalt/mnd')).toBeVisible();
        // Beløpet vises både for barnet og som totalsum.
        await expect(page.getByText(/^7\s500 kr$/)).toHaveCount(2);

        const behandlinger = page.getByRole('table').filter({ has: page.getByRole('columnheader', { name: 'Årsak' }) });
        await expect(
            behandlinger.getByRole('row', { name: /Søknad\s+Førstegangsbehandling\s+Nasjonal\s+Avsluttet/ })
        ).toBeVisible();
    });

    test('skal navigere til behandlingen ved klikk på resultatet i behandlingstabellen', async ({ page }) => {
        await page.goto('/fagsak/1/saksoversikt');

        await page
            .getByRole('row', { name: /Førstegangsbehandling/ })
            .getByRole('link', { name: 'Innvilget' })
            .click();

        await expect(page).toHaveURL(/\/fagsak\/1\/1\/registrer-soknad$/);
        await expect(page.getByRole('heading', { name: 'Registrer opplysninger fra søknaden' })).toBeVisible();
    });
});
