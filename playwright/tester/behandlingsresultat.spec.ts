import { byggSuksessRessurs } from '@navikt/familie-typer';
import { FagsakTestdata } from '@testutils/testdata/fagsakTestdata';
import { PersonTestdata } from '@testutils/testdata/personTestdata';
import { VedtaksperiodeTestdata } from '@testutils/testdata/vedtaksperiodeTestdata';
import { BehandlingSteg, type IBehandling } from '@typer/behandling';
import { YtelseType } from '@typer/beregning';
import { IEndretUtbetalingAndelÅrsak, type IRestEndretUtbetalingAndel } from '@typer/utbetalingAndel';
import { addMonths, endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { nb } from 'date-fns/locale';
import { HttpResponse, http } from 'msw';

import {
    BARN_IDENT,
    BARN_NAVN,
    KONTANTSTØTTE_SATS,
    lagBehandlingPåSteg,
    lagPersoner,
    SØKER_IDENT,
} from '../behandlingsdata';
import { lagBehandlingsmock } from '../behandlingsmock';
import { expect, test } from '../fixtures';

const BEHANDLINGSRESULTAT_STEG_URL = encodeURI('/familie-ks-sak/api/behandlinger/1/steg/behandlingsresultat');
const ENDRET_UTBETALING_URL = '/familie-ks-sak/api/endretutbetalingandel/1';

function lagBehandlingsresultatMock(endringer: Partial<IBehandling> = {}) {
    return lagBehandlingsmock(lagBehandlingPåSteg(BehandlingSteg.BEHANDLINGSRESULTAT, endringer), {
        fagsak: FagsakTestdata.lagFagsak({ søkerFødselsnummer: SØKER_IDENT }),
    });
}

/**
 * Oppsummeringen under tidslinjen viser utbetalingen for inneværende måned, så her får barnet kontantstøtte fra to
 * måneder tilbake til tre måneder fram i tid, uansett når testen kjøres.
 */
function lagTilkjentYtelseRundtDenneMåneden(): Partial<IBehandling> {
    const iDag = new Date();
    const fom = startOfMonth(subMonths(iDag, 2));
    const tom = endOfMonth(addMonths(iDag, 3));
    const stønadFom = format(fom, 'yyyy-MM');
    const stønadTom = format(tom, 'yyyy-MM');
    return {
        utbetalingsperioder: [
            VedtaksperiodeTestdata.lagUtbetalingsperiode({
                periodeFom: format(fom, 'yyyy-MM-dd'),
                periodeTom: format(tom, 'yyyy-MM-dd'),
                utbetalingsperiodeDetaljer: [
                    VedtaksperiodeTestdata.lagUtbetalingsperiodeDetalj({
                        person: lagPersoner()[1],
                        utbetaltPerMnd: KONTANTSTØTTE_SATS,
                    }),
                ],
            }),
        ],
        personerMedAndelerTilkjentYtelse: [
            PersonTestdata.lagPersonMedAndelerTilkjentYtelse({
                personIdent: BARN_IDENT,
                beløp: KONTANTSTØTTE_SATS,
                stønadFom,
                stønadTom,
                ytelsePerioder: [
                    {
                        beløp: KONTANTSTØTTE_SATS,
                        stønadFom,
                        stønadTom,
                        ytelseType: YtelseType.ORDINÆR_KONTANTSTØTTE,
                        skalUtbetales: true,
                    },
                ],
            }),
        ],
    };
}

test.describe('Behandlingsresultat', () => {
    test('skal vise utbetalingen denne måneden og gå videre til simulering', async ({ page, apiMock }) => {
        apiMock.use(...lagBehandlingsresultatMock(lagTilkjentYtelseRundtDenneMåneden()).handlers);

        await page.goto('/fagsak/1/1/tilkjent-ytelse');
        await expect(page.getByRole('heading', { name: 'Behandlingsresultat', level: 1 })).toBeVisible();

        const måned = format(new Date(), 'MMMM yyyy', { locale: nb });
        const månedstittel = måned.charAt(0).toUpperCase() + måned.slice(1);
        await expect(page.getByRole('heading', { name: månedstittel, level: 3 })).toBeVisible();
        await expect(page.getByText(new RegExp(`^${BARN_NAVN} \\(.*\\) \\| 100224 12345$`))).toBeVisible();
        await expect(page.getByText('Ingen plass')).toBeVisible();
        await expect(page.getByText('Totalt utbetalt per mnd')).toBeVisible();
        await expect(page.getByText(/^7\s500 kr$/)).toHaveCount(2);

        const stegRequest = page.waitForRequest(
            request => request.method() === 'POST' && new URL(request.url()).pathname === BEHANDLINGSRESULTAT_STEG_URL
        );
        await page.getByRole('button', { name: 'Neste steg' }).click();
        await stegRequest;

        await expect(page).toHaveURL('/fagsak/1/1/simulering');
        await expect(page.getByRole('heading', { name: 'Simulering', level: 1 })).toBeVisible();
    });

    test('skal opprette, fylle ut og lagre en endret utbetalingsperiode', async ({ page, apiMock }) => {
        const behandlingsmock = lagBehandlingsresultatMock();
        apiMock.use(
            http.post(ENDRET_UTBETALING_URL, () =>
                HttpResponse.json(
                    byggSuksessRessurs(
                        behandlingsmock.oppdater({
                            endretUtbetalingAndeler: [{ id: 1, personIdenter: [], erTilknyttetAndeler: false }],
                        })
                    )
                )
            ),
            http.put<never, IRestEndretUtbetalingAndel>(`${ENDRET_UTBETALING_URL}/1`, async ({ request }) => {
                const endretUtbetalingAndel = await request.json();
                return HttpResponse.json(
                    byggSuksessRessurs(
                        behandlingsmock.oppdater({
                            endretUtbetalingAndeler: [{ ...endretUtbetalingAndel, erTilknyttetAndeler: true }],
                        })
                    )
                );
            }),
            ...behandlingsmock.handlers
        );

        await page.goto('/fagsak/1/1/tilkjent-ytelse');
        await page.getByRole('button', { name: 'Endre utbetalingsperiode' }).click();

        // Den nye perioden er tom og åpnes rett i redigering.
        await expect(page.getByRole('heading', { name: 'Endrede utbetalingsperioder' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Ikke satt' })).toBeVisible();
        const skjema = page.getByRole('group', { name: 'Skjema for å endre utbetalingsandel' });

        await skjema.getByRole('button', { name: 'Bekreft' }).click();
        await expect(skjema.getByText('Du må velge minst én person')).toBeVisible();
        await expect(skjema.getByText('Du må velge f.o.m-dato')).toBeVisible();
        await expect(skjema.getByText('Du må velge en årsak')).toBeVisible();
        await expect(skjema.getByText('Du må velge om perioden skal utbetales')).toBeVisible();
        await expect(skjema.getByText('Du må oppgi en begrunnelse.')).toBeVisible();

        await skjema.getByRole('combobox', { name: 'Velg hvem det gjelder' }).click();
        await page.getByRole('option', { name: new RegExp(BARN_NAVN) }).click();
        await skjema.getByLabel('F.o.m', { exact: true }).fill('03.2025');
        await skjema.getByLabel('T.o.m', { exact: true }).fill('05.2025');
        await skjema.getByLabel('Årsak').selectOption({ label: 'Etterbetaling 3 måned' });
        await skjema.getByRole('radio', { name: 'Perioden skal ikke utbetales' }).check();
        await skjema.getByLabel('Søknadstidspunkt').fill('15.09.2025');
        await skjema.getByLabel('Begrunnelse').fill('Søknaden kom mer enn tre måneder etter at retten oppstod.');

        const lagreRequest = page.waitForRequest(
            request => request.method() === 'PUT' && new URL(request.url()).pathname === `${ENDRET_UTBETALING_URL}/1`
        );
        await skjema.getByRole('button', { name: 'Bekreft' }).click();

        expect((await lagreRequest).postDataJSON()).toEqual({
            id: 1,
            personIdenter: [BARN_IDENT],
            prosent: 0,
            fom: '2025-03',
            tom: '2025-05',
            årsak: IEndretUtbetalingAndelÅrsak.ETTERBETALING_3MND,
            søknadstidspunkt: '2025-09-15',
            begrunnelse: 'Søknaden kom mer enn tre måneder etter at retten oppstod.',
            erTilknyttetAndeler: false,
            erEksplisittAvslagPåSøknad: false,
            vedtaksbegrunnelser: [],
        });
        await expect(skjema).toBeHidden();
        await expect(page.getByRole('cell', { name: 'Etterbetaling 3 måned' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Nei', exact: true })).toBeVisible();
    });
});
