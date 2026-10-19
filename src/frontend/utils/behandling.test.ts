import { skruPåAlleToggles } from '@testutils/mocks/handlers/featureToggleHandlers';
import { lagVisningBehandling } from '@testutils/testdata/behandlingTestdata';
import { lagFagsak } from '@testutils/testdata/fagsakTestdata';
import {
    BehandlingStatus,
    Behandlingstype,
    BehandlingÅrsak,
    behandlingÅrsakerSomIkkeSkalSettesManuelt,
} from '@typer/behandling';
import { FagsakStatus } from '@typer/fagsak';
import { Klagebehandlingstype } from '@typer/klage';
import { Tilbakekrevingsbehandlingstype } from '@typer/tilbakekrevingsbehandling';
import { hentTilgjengeligeBehandlingstyper, hentTilgjengeligeBehandlingsårsaker } from '@utils/behandling';

describe('hentTilgjengeligeBehandlingstyper', () => {
    const toggles = skruPåAlleToggles();
    test('skal inneholde forventede behandlingstyper ved nyopprettet fagsak', () => {
        const fagsak = lagFagsak();

        const tilgjengeligeBehandlingstyper = hentTilgjengeligeBehandlingstyper(fagsak, toggles);
        const forventedeBehandlingstyper = [
            Behandlingstype.FØRSTEGANGSBEHANDLING,
            Tilbakekrevingsbehandlingstype.TILBAKEKREVING,
            Klagebehandlingstype.KLAGE,
        ];

        expect(new Set(tilgjengeligeBehandlingstyper)).toEqual(new Set(forventedeBehandlingstyper));
    });

    test('skal inneholde forventede behandlingstyper ved fagsak uten aktiv behandling', () => {
        const fagsak = lagFagsak({
            status: FagsakStatus.LØPENDE,
            behandlinger: [lagVisningBehandling({ aktiv: false })],
        });

        const tilgjengeligeBehandlingstyper = hentTilgjengeligeBehandlingstyper(fagsak, toggles);
        const forventedeBehandlingstyper = [
            Behandlingstype.REVURDERING,
            Behandlingstype.TEKNISK_ENDRING,
            Tilbakekrevingsbehandlingstype.TILBAKEKREVING,
            Klagebehandlingstype.KLAGE,
        ];
        expect(new Set(tilgjengeligeBehandlingstyper)).toEqual(new Set(forventedeBehandlingstyper));
    });

    test('skal ikke inneholde klage ved strengt fortrolig person i fagsak', () => {
        const fagsak = lagFagsak({ finnesStrengtFortroligPersonIFagsak: true });

        const tilgjengeligeBehandlingstyper = hentTilgjengeligeBehandlingstyper(fagsak, toggles);

        expect(tilgjengeligeBehandlingstyper).not.toContain(Klagebehandlingstype.KLAGE);
    });

    test('skal inneholde forventede behandlingstyper ved manuell journalføring med fagsak', () => {
        const fagsak = lagFagsak();
        const erManuellJournalføring = true;

        const tilgjengeligeBehandlingstyper = hentTilgjengeligeBehandlingstyper(
            fagsak,
            toggles,
            erManuellJournalføring
        );
        const forventedeBehandlingstyper = [Behandlingstype.FØRSTEGANGSBEHANDLING, Klagebehandlingstype.KLAGE];

        expect(new Set(tilgjengeligeBehandlingstyper)).toEqual(new Set(forventedeBehandlingstyper));
    });

    test('skal kun inneholde klage ved manuell journalføring med fagsak som har aktiv behandling', () => {
        const fagsak = lagFagsak({
            status: FagsakStatus.LØPENDE,
            behandlinger: [lagVisningBehandling({ status: BehandlingStatus.UTREDES })],
        });
        const erManuellJournalføring = true;

        const tilgjengeligeBehandlingstyper = hentTilgjengeligeBehandlingstyper(
            fagsak,
            toggles,
            erManuellJournalføring
        );
        const forventedeBehandlingstyper = [Klagebehandlingstype.KLAGE];

        expect(new Set(tilgjengeligeBehandlingstyper)).toEqual(new Set(forventedeBehandlingstyper));
    });

    test('skal inneholde forventede behandlingstyper ved manuell journalføring uten fagsak', () => {
        const erManuellJournalføring = true;

        const tilgjengeligeBehandlingstyper = hentTilgjengeligeBehandlingstyper(
            undefined,
            toggles,
            erManuellJournalføring
        );
        const forventedeBehandlingstyper = [Behandlingstype.FØRSTEGANGSBEHANDLING];

        expect(new Set(tilgjengeligeBehandlingstyper)).toEqual(new Set(forventedeBehandlingstyper));
    });
});

describe('hentTilgjengeligeBehandlingsårsaker', () => {
    test('skal kun inneholde årsaker som kan settes manuelt', () => {
        const tilgjengeligeBehandlingsårsaker = hentTilgjengeligeBehandlingsårsaker();
        const årsakerSomIkkeSkalSettesManuelt = behandlingÅrsakerSomIkkeSkalSettesManuelt();
        const overlappendeÅrsaker = tilgjengeligeBehandlingsårsaker.some(årsak =>
            årsakerSomIkkeSkalSettesManuelt.includes(årsak)
        );

        expect(overlappendeÅrsaker).toBe(false);
    });

    test('skal inneholde forventede årsaker', () => {
        const tilgjengeligeBehandlingsårsaker = hentTilgjengeligeBehandlingsårsaker();
        const forventedeÅrsaker = [
            BehandlingÅrsak.SØKNAD,
            BehandlingÅrsak.ÅRLIG_KONTROLL,
            BehandlingÅrsak.DØDSFALL,
            BehandlingÅrsak.NYE_OPPLYSNINGER,
            BehandlingÅrsak.OVERGANGSORDNING_2024,
            BehandlingÅrsak.IVERKSETTE_KA_VEDTAK,
            BehandlingÅrsak.BARNEHAGELISTE,
            BehandlingÅrsak.TEKNISK_ENDRING,
        ];
        expect(new Set(tilgjengeligeBehandlingsårsaker)).toEqual(new Set(forventedeÅrsaker));
    });
});
