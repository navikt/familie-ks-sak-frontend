import { byggSuksessRessurs } from '@navikt/familie-typer';
import type { Request } from '@playwright/test';
import { FagsakTestdata } from '@testutils/testdata/fagsakTestdata';
import { PersonTestdata } from '@testutils/testdata/personTestdata';
import { BehandlingSteg } from '@typer/behandling';
import { HttpResponse, http } from 'msw';

import {
    BARN_IDENT,
    BARN_NAVN,
    lagBehandlingPåSteg,
    lagPersonResultater,
    SØKER_IDENT,
    SØKERS_VILKÅR,
} from '../behandlingsdata';
import { lagBehandlingsmock } from '../behandlingsmock';
import { expect, test } from '../fixtures';

const REGISTRER_SØKNAD_URL = encodeURI('/familie-ks-sak/api/behandlinger/1/steg/registrer-søknad');

/** Behandling uten vilkårsvurdering. Backend lager vilkårene (ikke vurdert ennå) når søknaden registreres. */
function lagRegistrerSøknadMock() {
    return lagBehandlingsmock(lagBehandlingPåSteg(BehandlingSteg.REGISTRERE_SØKNAD, { personResultater: [] }), {
        fagsak: FagsakTestdata.lagFagsak({ søkerFødselsnummer: SØKER_IDENT }),
        etterSteg: {
            'registrer-søknad': {
                personResultater: lagPersonResultater({ ikkeVurderteVilkårForSøker: SØKERS_VILKÅR }),
            },
        },
    });
}

/** Søkeren i registeret, med barnet som eneste registrerte barn. */
const søkerMedBarn = http.post<never, { ident: string }>('/familie-ks-sak/api/person', async ({ request }) => {
    const { ident } = await request.json();
    return HttpResponse.json(
        byggSuksessRessurs(
            PersonTestdata.lagPerson({
                personIdent: ident,
                forelderBarnRelasjon: [
                    PersonTestdata.lagForelderBarnRelasjon({ navn: BARN_NAVN, personIdent: BARN_IDENT }),
                ],
            })
        )
    );
});

function erRegistrerSøknadKall(request: Request) {
    return request.method() === 'POST' && new URL(request.url()).pathname === REGISTRER_SØKNAD_URL;
}

test.describe('Registrer søknad', () => {
    test('skal kreve målform og minst ett barn før søknaden kan registreres', async ({ page, apiMock }) => {
        apiMock.use(...lagRegistrerSøknadMock().handlers, søkerMedBarn);
        const registreringskall: Request[] = [];
        page.on('request', request => {
            if (erRegistrerSøknadKall(request)) registreringskall.push(request);
        });

        await page.goto('/fagsak/1/1/registrer-soknad');
        await expect(page.getByRole('heading', { name: 'Registrer opplysninger fra søknaden' })).toBeVisible();
        await expect(page.getByRole('checkbox', { name: new RegExp(BARN_NAVN) })).not.toBeChecked();

        await page.getByRole('button', { name: 'Bekreft og fortsett' }).click();

        const feilsammendrag = page.getByRole('heading', { name: 'For å gå videre må du rette opp følgende feil:' });
        await expect(feilsammendrag).toBeVisible();
        await expect(page.getByRole('link', { name: 'Målform er påkrevd.' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Minst et barn er påkrevd.' })).toBeVisible();
        await expect(page).toHaveURL('/fagsak/1/1/registrer-soknad');
        expect(registreringskall).toHaveLength(0);

        await page.getByRole('checkbox', { name: new RegExp(BARN_NAVN) }).check();
        await page.getByRole('radio', { name: 'Bokmål' }).check();

        await expect(page.getByRole('link', { name: 'Målform er påkrevd.' })).toBeHidden();
        await expect(page.getByRole('link', { name: 'Minst et barn er påkrevd.' })).toBeHidden();
    });

    test('skal legge til et barn som ikke er folkeregistrert og kunne fjerne det igjen', async ({ page, apiMock }) => {
        apiMock.use(...lagRegistrerSøknadMock().handlers, søkerMedBarn);

        await page.goto('/fagsak/1/1/registrer-soknad');
        await page.getByRole('button', { name: 'Legg til barn' }).click();
        const modal = page.getByRole('dialog', { name: 'Legg til barn' });
        await modal
            .getByRole('radiogroup', { name: 'Barnet er folkeregistrert / har fødselsnummer' })
            .getByRole('radio', { name: 'Nei' })
            .check();
        await modal.getByRole('button', { name: 'Legg til', exact: true }).click();
        await expect(modal.getByText('Navn er påkrevd.')).toBeVisible();

        await modal.getByLabel('Barnets navn').fill('Lillebror Testersen');
        await modal.getByLabel('Fødselsdato (valgfri)').fill('01.06.2025');
        await modal.getByRole('button', { name: 'Legg til', exact: true }).click();

        await expect(modal).toBeHidden();
        // Barn uten fødselsnummer har ingen ident og merkes som manuelt registrert.
        const nyttBarn = page.getByRole('checkbox', { name: /^Lillebror Testersen .*manuelt registrert$/ });
        await expect(nyttBarn).toBeChecked();

        await page.getByRole('button', { name: 'Fjern barn' }).click();
        await page
            .getByRole('alertdialog', { name: 'Bekreft fjerning av barn' })
            .getByRole('button', { name: 'Fjern', exact: true })
            .click();

        await expect(nyttBarn).toHaveCount(0);
        await expect(page.getByRole('checkbox', { name: new RegExp(BARN_NAVN) })).toBeVisible();
        // Barn fra folkeregisteret kan ikke fjernes.
        await expect(page.getByRole('button', { name: 'Fjern barn' })).toHaveCount(0);
    });
});
