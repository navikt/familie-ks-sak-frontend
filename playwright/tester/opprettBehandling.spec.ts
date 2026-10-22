import type { Page } from '@playwright/test';
import { BehandlingTestdata } from '@testutils/testdata/behandlingTestdata';
import { FagsakTestdata } from '@testutils/testdata/fagsakTestdata';
import { BehandlingSteg, Behandlingstype, BehandlingÅrsak } from '@typer/behandling';
import { BehandlingKategori } from '@typer/behandlingstema';
import { FagsakStatus } from '@typer/fagsak';
import { format } from 'date-fns';

import { lagBehandlingPåSteg, SØKER_IDENT } from '../behandlingsdata';
import { lagBehandlingsmock } from '../behandlingsmock';
import { expect, test } from '../fixtures';

const OPPRETT_BEHANDLING_URL = '/familie-ks-sak/api/behandlinger';
const NY_BEHANDLING_ID = 2;

/** Løpende fagsak med en avsluttet førstegangsbehandling, som kan revurderes. */
function lagLøpendeFagsak() {
    return FagsakTestdata.lagFagsak({
        søkerFødselsnummer: SØKER_IDENT,
        status: FagsakStatus.LØPENDE,
        behandlinger: [BehandlingTestdata.lagVisningBehandling({ behandlingId: 1 })],
    });
}

async function åpneOpprettBehandling(page: Page) {
    await page.goto('/fagsak/1/saksoversikt');
    await page.getByRole('button', { name: 'Meny' }).click();
    await page.getByRole('menuitem', { name: 'Opprett behandling' }).click();
    return page.getByRole('dialog', { name: 'Opprett ny behandling' });
}

test.describe('Opprett behandling', () => {
    test('skal opprette førstegangsbehandling og gå til registrering av søknaden', async ({ page, apiMock }) => {
        // Ny fagsak uten behandlinger: bare førstegangsbehandling (og tilbakekreving/klage) kan opprettes.
        const behandlingsmock = lagBehandlingsmock(
            lagBehandlingPåSteg(BehandlingSteg.REGISTRERE_SØKNAD, {
                behandlingId: NY_BEHANDLING_ID,
                personResultater: [],
            }),
            {
                fagsak: FagsakTestdata.lagFagsak({
                    søkerFødselsnummer: SØKER_IDENT,
                    status: FagsakStatus.OPPRETTET,
                    behandlinger: [],
                }),
                opprettes: true,
            }
        );
        apiMock.use(...behandlingsmock.handlers);

        const modal = await åpneOpprettBehandling(page);
        const behandlingstype = modal.getByLabel('Velg type behandling');
        await expect(behandlingstype.getByRole('option', { name: 'Førstegangsbehandling' })).toBeAttached();
        await expect(behandlingstype.getByRole('option', { name: 'Revurdering' })).toHaveCount(0);

        await modal.getByRole('button', { name: 'Bekreft' }).click();
        await expect(modal.getByText('Velg type behandling som skal opprettes fra nedtrekkslisten.')).toBeVisible();

        await behandlingstype.selectOption({ label: 'Førstegangsbehandling' });
        await modal.getByLabel('Velg behandlingstema').selectOption({ label: 'Nasjonal' });
        const iDag = new Date();
        await modal.getByLabel('Søknad mottatt dato').fill(format(iDag, 'dd.MM.yyyy'));

        const opprettRequest = page.waitForRequest(
            request => request.method() === 'POST' && new URL(request.url()).pathname === OPPRETT_BEHANDLING_URL
        );
        await modal.getByRole('button', { name: 'Bekreft' }).click();

        expect((await opprettRequest).postDataJSON()).toEqual({
            behandlingType: Behandlingstype.FØRSTEGANGSBEHANDLING,
            behandlingÅrsak: BehandlingÅrsak.SØKNAD,
            kategori: BehandlingKategori.NASJONAL,
            saksbehandlerIdent: 'A1',
            søkersIdent: SØKER_IDENT,
            søknadMottattDato: format(iDag, 'yyyy-MM-dd'),
        });
        await expect(page).toHaveURL(`/fagsak/1/${NY_BEHANDLING_ID}/registrer-soknad`);
        await expect(page.getByRole('heading', { name: 'Registrer opplysninger fra søknaden' })).toBeVisible();
        await expect(modal).toBeHidden();
    });

    test('skal opprette revurdering med valgt årsak og gå til vilkårsvurderingen', async ({ page, apiMock }) => {
        // Løpende fagsak med en avsluttet førstegangsbehandling: nå skal det revurderes, ikke søkes på nytt.
        const behandlingsmock = lagBehandlingsmock(
            lagBehandlingPåSteg(BehandlingSteg.VILKÅRSVURDERING, {
                behandlingId: NY_BEHANDLING_ID,
                type: Behandlingstype.REVURDERING,
                årsak: BehandlingÅrsak.NYE_OPPLYSNINGER,
            }),
            { fagsak: lagLøpendeFagsak(), opprettes: true }
        );
        apiMock.use(...behandlingsmock.handlers);

        const modal = await åpneOpprettBehandling(page);
        const behandlingstype = modal.getByLabel('Velg type behandling');
        await expect(behandlingstype.getByRole('option', { name: 'Førstegangsbehandling' })).toHaveCount(0);

        await behandlingstype.selectOption({ label: 'Revurdering' });
        await modal.getByLabel('Velg behandlingsårsak').selectOption({ label: 'Nye opplysninger' });
        // Søknadsdato og behandlingstema spørres bare om når revurderingen gjelder en søknad.
        await expect(modal.getByLabel('Søknad mottatt dato')).toHaveCount(0);
        await expect(modal.getByLabel('Velg behandlingstema')).toHaveCount(0);

        const opprettRequest = page.waitForRequest(
            request => request.method() === 'POST' && new URL(request.url()).pathname === OPPRETT_BEHANDLING_URL
        );
        await modal.getByRole('button', { name: 'Bekreft' }).click();

        expect((await opprettRequest).postDataJSON()).toEqual({
            behandlingType: Behandlingstype.REVURDERING,
            behandlingÅrsak: BehandlingÅrsak.NYE_OPPLYSNINGER,
            kategori: null,
            saksbehandlerIdent: 'A1',
            søkersIdent: SØKER_IDENT,
        });
        await expect(page).toHaveURL(`/fagsak/1/${NY_BEHANDLING_ID}/vilkaarsvurdering`);
        await expect(page.getByRole('heading', { name: 'Vilkårsvurdering', level: 1 })).toBeVisible();
    });
});
