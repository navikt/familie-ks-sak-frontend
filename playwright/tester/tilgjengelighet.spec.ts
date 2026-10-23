import AxeBuilder from '@axe-core/playwright';
import { BehandlingSteg } from '@typer/behandling';

import { lagBehandlingPåSteg } from '../behandlingsdata';
import { lagBehandlingsmock } from '../behandlingsmock';
import { expect, test } from '../fixtures';

const WCAG_21_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

// Ikoner fra @navikt/aksel-icons uten `title` eller `aria-hidden`, bl.a. i Fagsaklinje, Behandlingslinje og lenkene til
// klage- og tilbakekrevingsbehandlinger i saksoversikten.
const IKONER_UTEN_TEKST = 'svg-img-alt';

// Lukkeknappen med XMarkIcon i Oppsummeringsboks.tsx på behandlingsresultatet har ingen tekst.
const KNAPP_UTEN_TEKST = 'button-name';

interface Side {
    navn: string;
    url: string;
    overskrift: string;
    steg?: BehandlingSteg;
    /**
     * Antall elementer per axe-regel som bryter i dag. Testen feiler hvis antallet endrer seg, slik at nye brudd fanges
     * opp også for regler siden allerede bryter. Tell ned når et brudd er rettet, og fjern regelen når alle er rettet.
     */
    kjenteBrudd?: Record<string, number>;
}

const SIDER: Side[] = [
    { navn: 'Oppgavebenken', url: '/oppgaver', overskrift: 'Oppgavebenken' },
    { navn: 'Journalføring', url: '/oppgaver/journalfor/1', overskrift: 'Bruker og avsender' },
    { navn: 'Barnehagelister', url: '/barnehagelister', overskrift: 'Barnehageliste KS sak' },
    {
        navn: 'Saksoversikt',
        url: '/fagsak/1/saksoversikt',
        overskrift: 'Saksoversikt',
        kjenteBrudd: { [IKONER_UTEN_TEKST]: 3 },
    },
    {
        navn: 'Dokumenter',
        url: '/fagsak/1/dokumenter',
        overskrift: 'Dokumentoversikt',
        kjenteBrudd: { [IKONER_UTEN_TEKST]: 3 },
    },
    {
        navn: 'Send informasjonsbrev',
        url: '/fagsak/1/dokumentutsending',
        overskrift: 'Send informasjonsbrev',
        kjenteBrudd: { [IKONER_UTEN_TEKST]: 4 },
    },
    {
        navn: 'Registrer søknad',
        url: '/fagsak/1/1/registrer-soknad',
        overskrift: 'Registrer opplysninger fra søknaden',
        steg: BehandlingSteg.REGISTRERE_SØKNAD,
        kjenteBrudd: { [IKONER_UTEN_TEKST]: 4 },
    },
    {
        navn: 'Vilkårsvurdering',
        url: '/fagsak/1/1/vilkaarsvurdering',
        overskrift: 'Vilkårsvurdering',
        steg: BehandlingSteg.VILKÅRSVURDERING,
        kjenteBrudd: { [IKONER_UTEN_TEKST]: 4 },
    },
    {
        navn: 'Behandlingsresultat',
        url: '/fagsak/1/1/tilkjent-ytelse',
        overskrift: 'Behandlingsresultat',
        steg: BehandlingSteg.BEHANDLINGSRESULTAT,
        kjenteBrudd: { [IKONER_UTEN_TEKST]: 5, [KNAPP_UTEN_TEKST]: 1 },
    },
    {
        navn: 'Simulering',
        url: '/fagsak/1/1/simulering',
        overskrift: 'Simulering',
        steg: BehandlingSteg.SIMULERING,
        kjenteBrudd: { [IKONER_UTEN_TEKST]: 3 },
    },
    {
        navn: 'Vedtak',
        url: '/fagsak/1/1/vedtak',
        overskrift: 'Vedtak',
        steg: BehandlingSteg.VEDTAK,
        kjenteBrudd: { [IKONER_UTEN_TEKST]: 4 },
    },
];

test.describe('Tilgjengelighet', () => {
    for (const { navn, url, overskrift, steg, kjenteBrudd = {} } of SIDER) {
        test(`${navn} skal ikke ha nye brudd på WCAG 2.1 AA`, async ({ page, apiMock }) => {
            if (steg) {
                apiMock.use(...lagBehandlingsmock(lagBehandlingPåSteg(steg)).handlers);
            }

            await page.goto(url);
            await expect(page.getByRole('heading', { name: overskrift, exact: true }).first()).toBeVisible();

            const { violations } = await new AxeBuilder({ page }).withTags(WCAG_21_AA).analyze();

            const antallBruddPerRegel = Object.fromEntries(violations.map(({ id, nodes }) => [id, nodes.length]));
            const beskrivelse = violations
                .map(({ id, help, nodes }) => `${id}: ${help}\n${nodes.map(({ target }) => `  ${target}`).join('\n')}`)
                .join('\n');
            expect(antallBruddPerRegel, beskrivelse).toEqual(kjenteBrudd);
        });
    }
});
