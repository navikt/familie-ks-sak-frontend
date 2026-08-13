import { skruPåAlleToggles } from '@testutils/mocks/handlers/featureToggleHandlers';
import { lagVisningBehandling } from '@testutils/testdata/behandlingTestdata';
import { lagFagsak } from '@testutils/testdata/fagsakTestdata';
import { Behandlingstype } from '@typer/behandling';
import { FagsakStatus } from '@typer/fagsak';
import { Klagebehandlingstype } from '@typer/klage';
import { Tilbakekrevingsbehandlingstype } from '@typer/tilbakekrevingsbehandling';
import { hentTilgjengeligeBehandlingstyper } from '@utils/behandling';

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
});
