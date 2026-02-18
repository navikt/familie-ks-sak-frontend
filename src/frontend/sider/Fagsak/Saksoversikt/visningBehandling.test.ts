import { describe, test } from 'vitest';

import { lagVisningsBehandlingFraBehandling } from './visningBehandling';
import { lagBehandling } from '../../../testutils/testdata/behandlingTestdata';
import { BehandlingResultat, BehandlingStatus, Behandlingstype, BehandlingÅrsak } from '../../../typer/behandling';
import { BehandlingKategori } from '../../../typer/behandlingstema';

describe('lagVisningsBehandlingFraBehandling', () => {
    test('skal lage visningsbehanlding med vedtaksdato', () => {
        const behandling = lagBehandling({
            aktiv: true,
            behandlingId: 1,
            kategori: BehandlingKategori.NASJONAL,
            opprettetTidspunkt: '2025-01-01T13:00:00.000',
            aktivertTidspunkt: '2025-01-01T13:00:00.000',
            resultat: BehandlingResultat.INNVILGET,
            status: BehandlingStatus.AVSLUTTET,
            type: Behandlingstype.FØRSTEGANGSBEHANDLING,
            vedtak: {
                id: 1,
                aktiv: true,
                vedtaksdato: '2025-01-01',
                vedtaksperioderMedBegrunnelser: [],
            },
            årsak: BehandlingÅrsak.SØKNAD,
        });

        const visningsbehandling = lagVisningsBehandlingFraBehandling(behandling);

        expect(visningsbehandling.aktiv).toBe(behandling.aktiv);
        expect(visningsbehandling.behandlingId).toBe(behandling.behandlingId);
        expect(visningsbehandling.kategori).toBe(behandling.kategori);
        expect(visningsbehandling.opprettetTidspunkt).toBe(behandling.opprettetTidspunkt);
        expect(visningsbehandling.aktivertTidspunkt).toBe(behandling.aktivertTidspunkt);
        expect(visningsbehandling.resultat).toBe(behandling.resultat);
        expect(visningsbehandling.status).toBe(behandling.status);
        expect(visningsbehandling.type).toBe(behandling.type);
        expect(visningsbehandling.vedtaksdato).toBe(behandling.vedtak?.vedtaksdato);
        expect(visningsbehandling.årsak).toBe(behandling.årsak);
    });

    test('skal lage visningsbehanlding uten vedtaksdato', () => {
        const behandling = lagBehandling({
            aktiv: true,
            behandlingId: 1,
            kategori: BehandlingKategori.NASJONAL,
            opprettetTidspunkt: '2025-01-01T13:00:00.000',
            aktivertTidspunkt: '2025-01-01T13:00:00.000',
            resultat: BehandlingResultat.IKKE_VURDERT,
            status: BehandlingStatus.UTREDES,
            type: Behandlingstype.FØRSTEGANGSBEHANDLING,
            vedtak: undefined,
            årsak: BehandlingÅrsak.SØKNAD,
        });

        const visningsbehandling = lagVisningsBehandlingFraBehandling(behandling);

        expect(visningsbehandling.aktiv).toBe(behandling.aktiv);
        expect(visningsbehandling.behandlingId).toBe(behandling.behandlingId);
        expect(visningsbehandling.kategori).toBe(behandling.kategori);
        expect(visningsbehandling.opprettetTidspunkt).toBe(behandling.opprettetTidspunkt);
        expect(visningsbehandling.aktivertTidspunkt).toBe(behandling.aktivertTidspunkt);
        expect(visningsbehandling.resultat).toBe(behandling.resultat);
        expect(visningsbehandling.status).toBe(behandling.status);
        expect(visningsbehandling.type).toBe(behandling.type);
        expect(visningsbehandling.vedtaksdato).toBe(undefined);
        expect(visningsbehandling.årsak).toBe(behandling.årsak);
    });
});
