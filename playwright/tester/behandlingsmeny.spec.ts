import { byggSuksessRessurs } from '@navikt/familie-typer';
import { TOM_PDF_BASE64 } from '@testutils/mocks/handlers/dokumentHandlers';
import {
    BehandlingResultat,
    BehandlingStatus,
    BehandlingSteg,
    BehandlingÅrsak,
    HenleggÅrsak,
    type IBehandlingPåVent,
    SettPåVentÅrsak,
} from '@typer/behandling';
import { addDays, format } from 'date-fns';
import { HttpResponse, http } from 'msw';

import { BARN_IDENT, lagBehandlingPåSteg } from '../behandlingsdata';
import { type Behandlingsmock, lagBehandlingsmock } from '../behandlingsmock';
import { expect, I_DAG, test } from '../fixtures';

const HENLEGG_URL = '/familie-ks-sak/api/behandlinger/1/henlegg';
const SETT_PÅ_VENT_URL = encodeURI('/familie-ks-sak/api/behandlinger/:behandlingId/sett-på-vent');
const GYLDIG_BARN_IDENT = '15062450050';

function lagHenleggHandler(behandlingsmock: Behandlingsmock) {
    return http.put('/familie-ks-sak/api/behandlinger/:behandlingId/henlegg', () =>
        HttpResponse.json(
            byggSuksessRessurs(
                behandlingsmock.oppdater({
                    status: BehandlingStatus.AVSLUTTET,
                    resultat: BehandlingResultat.HENLAGT_SØKNAD_TRUKKET,
                })
            )
        )
    );
}

test.describe('Behandlingsmeny', () => {
    test('skal forhåndsvise brevet og henlegge behandlingen når søknaden er trukket', async ({ page, apiMock }) => {
        const behandlingsmock = lagBehandlingsmock(lagBehandlingPåSteg(BehandlingSteg.VILKÅRSVURDERING));
        apiMock.use(
            http.post('/familie-ks-sak/api/brev/forhaandsvis-brev/:behandlingId', () =>
                HttpResponse.json(byggSuksessRessurs(TOM_PDF_BASE64))
            ),
            lagHenleggHandler(behandlingsmock),
            ...behandlingsmock.handlers
        );

        await page.goto('/fagsak/1/1/vilkaarsvurdering');
        await page.getByRole('button', { name: 'Meny', exact: true }).click();
        await page.getByRole('menuitem', { name: 'Henlegg behandling' }).click();

        const modal = page.getByRole('dialog', { name: 'Henlegg behandling' });
        await modal.getByLabel('Velg årsak').selectOption({ label: 'Søknaden er trukket' });
        await modal.getByLabel('Begrunnelse').fill('Søker har trukket søknaden.');

        const forhåndsvisRequest = page.waitForRequest(request =>
            request.url().endsWith('/familie-ks-sak/api/brev/forhaandsvis-brev/1')
        );
        await modal.getByText('Forhåndsvis', { exact: true }).click();

        expect((await forhåndsvisRequest).postDataJSON()).toEqual({
            mottakerIdent: '12345678903',
            multiselectVerdier: [],
            brevmal: 'HENLEGGE_TRUKKET_SØKNAD',
            barnIBrev: [],
        });
        const forhåndsvisning = page.getByRole('dialog', { name: 'Forhåndsvisning av henleggelsesbrev' });
        await expect(forhåndsvisning.locator('iframe[title="Dokument"]')).toBeVisible();
        // Escape ville lukket henleggelsesmodalen også, så forhåndsvisningen lukkes med knappen.
        await forhåndsvisning.getByRole('button', { name: 'Lukk' }).click();
        await expect(forhåndsvisning).toBeHidden();

        const henleggRequest = page.waitForRequest(request => request.url().endsWith(HENLEGG_URL));
        await modal.getByRole('button', { name: 'Bekreft og send brev' }).click();

        const henlegg = await henleggRequest;
        expect(henlegg.method()).toBe('PUT');
        expect(henlegg.postDataJSON()).toEqual({
            årsak: HenleggÅrsak.SØKNAD_TRUKKET,
            begrunnelse: 'Søker har trukket søknaden.',
        });

        const kvittering = page.getByRole('dialog', { name: 'Behandling henlagt' });
        await expect(kvittering.getByText('Behandlingen er henlagt og brev til bruker er sendt.')).toBeVisible();
        expect(behandlingsmock.hent().resultat).toBe(BehandlingResultat.HENLAGT_SØKNAD_TRUKKET);

        await kvittering.getByRole('button', { name: 'Se saksoversikt' }).click();
        await expect(page).toHaveURL(/\/fagsak\/1\/saksoversikt$/);
    });

    test('skal sette behandlingen på vent', async ({ page, apiMock }) => {
        const behandlingsmock = lagBehandlingsmock(lagBehandlingPåSteg(BehandlingSteg.VILKÅRSVURDERING));
        apiMock.use(
            http.post<never, IBehandlingPåVent>(SETT_PÅ_VENT_URL, async ({ request }) =>
                HttpResponse.json(
                    byggSuksessRessurs(behandlingsmock.oppdater({ behandlingPåVent: await request.json() }))
                )
            ),
            ...behandlingsmock.handlers
        );

        await page.goto('/fagsak/1/1/vilkaarsvurdering');
        await page.getByRole('button', { name: 'Meny', exact: true }).click();
        await page.getByRole('menuitem', { name: 'Sett behandling på vent' }).click();

        const modal = page.getByRole('dialog', { name: 'Sett behandling på vent' });
        const standardfrist = addDays(I_DAG, 21);
        await expect(modal.getByLabel('Frist')).toHaveValue(format(standardfrist, 'dd.MM.yyyy'));

        await modal.getByRole('button', { name: 'Bekreft' }).click();
        await expect(modal.getByText('Du må velge en årsak')).toBeVisible();

        await modal.getByLabel('Årsak').selectOption({ label: 'Avventer dokumentasjon' });

        const settPåVentRequest = page.waitForRequest(
            request =>
                request.method() === 'POST' &&
                request.url().endsWith(encodeURI('/familie-ks-sak/api/behandlinger/1/sett-på-vent'))
        );
        await modal.getByRole('button', { name: 'Bekreft' }).click();

        expect((await settPåVentRequest).postDataJSON()).toEqual({
            frist: format(standardfrist, 'yyyy-MM-dd'),
            årsak: SettPåVentÅrsak.AVVENTER_DOKUMENTASJON,
        });
        await expect(modal).toBeHidden();
        await expect(
            page.getByText(
                `Årsak: Avventer dokumentasjon. Frist: ${format(standardfrist, 'dd.MM.yyyy')}. Fortsett behandling via menyen.`
            )
        ).toBeVisible();
        // KS beholder status UTREDES og markerer ventingen med behandlingPåVent.
        expect(behandlingsmock.hent().status).toBe(BehandlingStatus.UTREDES);
        expect(behandlingsmock.hent().behandlingPåVent?.årsak).toBe(SettPåVentÅrsak.AVVENTER_DOKUMENTASJON);
    });

    test('skal legge til barn på behandlingen', async ({ page, apiMock }) => {
        // Menyvalget vises bare for behandlinger på nye opplysninger eller klage.
        const behandlingsmock = lagBehandlingsmock(
            lagBehandlingPåSteg(BehandlingSteg.VILKÅRSVURDERING, { årsak: BehandlingÅrsak.NYE_OPPLYSNINGER })
        );
        apiMock.use(
            http.post('/familie-ks-sak/api/behandlinger/:behandlingId/legg-til-barn', () =>
                HttpResponse.json(byggSuksessRessurs(behandlingsmock.hent()))
            ),
            ...behandlingsmock.handlers
        );

        await page.goto('/fagsak/1/1/vilkaarsvurdering');
        await page.getByRole('button', { name: 'Meny', exact: true }).click();
        await page.getByRole('menuitem', { name: 'Legg til barn' }).click();

        const modal = page.getByRole('dialog', { name: 'Legg til barn' });
        const fødselsnummer = modal.getByLabel('Fødselsnummer');
        await modal.getByRole('button', { name: 'Legg til' }).click();
        await expect(modal.getByText('Fødselsnummer eller D-nummer må oppgis.')).toBeVisible();

        await fødselsnummer.fill('12345');
        await modal.getByRole('button', { name: 'Legg til' }).click();
        await expect(modal.getByText('Fødselsnummer eller D-nummer må være 11 siffer.')).toBeVisible();

        // BARN_IDENT i testdataene har ugyldig kontrollsiffer.
        await fødselsnummer.fill(BARN_IDENT);
        await modal.getByRole('button', { name: 'Legg til' }).click();
        await expect(modal.getByText('Fødselsnummer eller D-nummer er ugyldig.')).toBeVisible();

        await fødselsnummer.fill(GYLDIG_BARN_IDENT);
        const tilgangRequest = page.waitForRequest('**/familie-ks-sak/api/tilgang');
        const leggTilBarnRequest = page.waitForRequest('**/familie-ks-sak/api/behandlinger/1/legg-til-barn');
        await modal.getByRole('button', { name: 'Legg til' }).click();

        expect((await tilgangRequest).postDataJSON()).toEqual({ brukerIdent: GYLDIG_BARN_IDENT });
        expect((await leggTilBarnRequest).postDataJSON()).toEqual({ barnIdent: GYLDIG_BARN_IDENT });
        await expect(modal).toBeHidden();
    });
});
