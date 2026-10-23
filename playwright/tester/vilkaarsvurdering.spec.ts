import type { Request } from '@playwright/test';
import { FagsakTestdata } from '@testutils/testdata/fagsakTestdata';
import { VilkårResultatTestdata } from '@testutils/testdata/vilkårResultatTestdata';
import { BehandlingSteg } from '@typer/behandling';
import { Resultat, VilkårType } from '@typer/vilkår';

import {
    BARN_IDENT,
    BARN_NAVN,
    lagBehandlingPåSteg,
    lagPersonResultater,
    SØKER_IDENT,
    SØKER_NAVN,
    vilkårResultatId,
} from '../behandlingsdata';
import { lagBehandlingsmock } from '../behandlingsmock';
import { expect, test } from '../fixtures';

const VILKÅRSVURDERING_URL = encodeURI('/familie-ks-sak/api/vilkårsvurdering/1');
const VILKÅRSVURDERING_STEG_URL = encodeURI('/familie-ks-sak/api/behandlinger/1/steg/vilkårsvurdering');

function lagVilkårsvurderingMock(ikkeVurderteVilkårForSøker: VilkårType[] = []) {
    return lagBehandlingsmock(
        lagBehandlingPåSteg(BehandlingSteg.VILKÅRSVURDERING, {
            personResultater: lagPersonResultater({ ikkeVurderteVilkårForSøker }),
        }),
        { fagsak: FagsakTestdata.lagFagsak({ søkerFødselsnummer: SØKER_IDENT }) }
    );
}

function erStegkall(request: Request) {
    return request.method() === 'POST' && new URL(request.url()).pathname === VILKÅRSVURDERING_STEG_URL;
}

test.describe('Vilkårsvurdering', () => {
    test('skal vise vilkårene for søker og barn', async ({ page, apiMock }) => {
        apiMock.use(...lagVilkårsvurderingMock().handlers);

        await page.goto('/fagsak/1/1/vilkaarsvurdering');

        await expect(page.getByRole('heading', { name: 'Vilkårsvurdering', level: 1 })).toBeVisible();
        await expect(page.getByRole('heading', { name: new RegExp(`^${SØKER_NAVN}`) })).toBeVisible();
        await expect(page.getByRole('heading', { name: new RegExp(`^${BARN_NAVN}`) })).toBeVisible();

        // Når alle vilkår er vurdert, er vurderingen for hver person lukket.
        const visVilkårsvurdering = page.getByRole('button', { name: 'Vis vilkårsvurdering' });
        await expect(visVilkårsvurdering).toHaveCount(2);
        await expect(page.getByRole('heading', { name: 'Barnets alder' })).toBeHidden();
        await visVilkårsvurdering.first().click();
        await visVilkårsvurdering.first().click();
        await expect(page.getByRole('button', { name: 'Skjul vilkårsvurdering' })).toHaveCount(2);

        // Søker: Bosatt i riket, Medlemskap, Lovlig opphold og Opplysningsplikt.
        // Barn: Barnets alder, Barnehageplass, Bor fast hos søker, Bosatt i riket og Medlemskap annen forelder.
        await expect(page.getByRole('heading', { name: 'Bosatt i riket', exact: true })).toHaveCount(2);
        for (const vilkår of [
            'Medlemskap',
            'Lovlig opphold',
            'Opplysningsplikt',
            'Barnets alder',
            'Barnehageplass',
            'Bor fast hos søker',
            'Medlemskap annen forelder',
        ]) {
            await expect(page.getByRole('heading', { name: vilkår, exact: true })).toBeVisible();
        }
        await expect(page.getByRole('cell', { name: 'Oppfylt', exact: true })).toHaveCount(9);
    });

    test('skal ikke gå videre før alle vilkår er vurdert', async ({ page, apiMock }) => {
        apiMock.use(...lagVilkårsvurderingMock([VilkårType.MEDLEMSKAP]).handlers);
        const stegkall: Request[] = [];
        page.on('request', request => {
            if (erStegkall(request)) stegkall.push(request);
        });

        await page.goto('/fagsak/1/1/vilkaarsvurdering');
        // Vilkår som ikke er vurdert, åpnes automatisk slik at saksbehandler kan fylle dem ut.
        await expect(page.getByRole('group', { name: 'Endre vilkår' })).toBeVisible();
        await expect(
            page.getByRole('radiogroup', { name: 'Har søker vært medlem i folketrygden i minst 5 år?' })
        ).toBeVisible();

        await page.getByRole('button', { name: 'Neste steg' }).click();

        await expect(page.getByRole('heading', { name: 'For å gå videre må du rette opp følgende:' })).toBeVisible();
        await expect(
            page.getByRole('link', { name: "Et vilkår av typen 'Medlemskap' er ikke fullstendig" })
        ).toBeVisible();
        await expect(page).toHaveURL('/fagsak/1/1/vilkaarsvurdering');
        expect(stegkall).toHaveLength(0);
    });

    test('skal vurdere barnehageplass med antall timer', async ({ page, apiMock }) => {
        const barnehageplassId = vilkårResultatId(BARN_IDENT, VilkårType.BARNEHAGEPLASS);
        const personResultater = lagPersonResultater().map(personResultat => ({
            ...personResultat,
            vilkårResultater: personResultat.vilkårResultater.map(vilkårResultat =>
                vilkårResultat.id === barnehageplassId
                    ? VilkårResultatTestdata.lagVilkårResultat({
                          id: barnehageplassId,
                          vilkårType: VilkårType.BARNEHAGEPLASS,
                          begrunnelse: '',
                      })
                    : vilkårResultat
            ),
        }));
        apiMock.use(
            ...lagBehandlingsmock(lagBehandlingPåSteg(BehandlingSteg.VILKÅRSVURDERING, { personResultater }), {
                fagsak: FagsakTestdata.lagFagsak({ søkerFødselsnummer: SØKER_IDENT }),
            }).handlers
        );

        await page.goto('/fagsak/1/1/vilkaarsvurdering');
        const skjema = page.getByRole('group', { name: 'Endre vilkår' });
        const oppfylteVurderinger = page.getByRole('cell', { name: 'Oppfylt', exact: true });
        await expect(oppfylteVurderinger).toHaveCount(4);

        await skjema
            .getByRole('radiogroup', { name: 'Har barnet barnehageplass?' })
            .getByRole('radio', { name: 'Ja' })
            .check();
        // Fra 33 timer i uka har barnet fulltidsplass, og da er vilkåret ikke oppfylt.
        await skjema.getByLabel('Antall timer').fill('33');
        await expect(skjema.getByRole('checkbox', { name: 'Vurderingen er et avslag' })).toBeVisible();
        await skjema.getByLabel('Antall timer').fill('20');
        await expect(skjema.getByRole('checkbox', { name: 'Vurderingen er et avslag' })).toHaveCount(0);
        await skjema.getByLabel('F.o.m', { exact: true }).fill('01.08.2025');
        await skjema.getByLabel(/^Begrunnelse/).fill('Barnet har deltidsplass i barnehage.');

        const lagreRequest = page.waitForRequest(
            request => request.method() === 'PUT' && new URL(request.url()).pathname === VILKÅRSVURDERING_URL
        );
        await skjema.getByRole('button', { name: 'Ferdig' }).click();

        expect((await lagreRequest).postDataJSON()).toEqual({
            personIdent: BARN_IDENT,
            endretVilkårResultat: expect.objectContaining({
                id: barnehageplassId,
                vilkårType: VilkårType.BARNEHAGEPLASS,
                resultat: Resultat.OPPFYLT,
                antallTimer: 20,
                søkerHarMeldtFraOmBarnehageplass: false,
                periodeFom: '2025-08-01',
                begrunnelse: 'Barnet har deltidsplass i barnehage.',
            }),
        });
        await expect(skjema).toBeHidden();
        await expect(oppfylteVurderinger).toHaveCount(5);
    });
});
