import { apiClient } from '@api/client/apiClient';
import { opprettBehandling } from '@api/opprettBehandling';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { Behandlingstype, BehandlingÅrsak } from '@typer/behandling';
import { BehandlingKategori } from '@typer/behandlingstema';
import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('@api/client/apiClient', () => ({
    apiClient: {
        post: vi.fn(),
    },
}));

afterEach(() => {
    vi.clearAllMocks();
});

describe('opprettBehandling', () => {
    test('skal sende forespørsel om opprettelse av behandling', async () => {
        const payload = {
            kategori: BehandlingKategori.NASJONAL,
            behandlingType: Behandlingstype.FØRSTEGANGSBEHANDLING,
            behandlingÅrsak: BehandlingÅrsak.SØKNAD,
            saksbehandlerIdent: 'Z123456',
            søkersIdent: '129499012851',
            søknadMottattDato: '2026-08-04',
        };

        const behandling = lagBehandling({
            kategori: payload.kategori,
            type: payload.behandlingType,
            årsak: payload.behandlingÅrsak,
            endretAv: payload.saksbehandlerIdent,
            søknadMottattDato: '2026-08-04T00:00:00',
        });

        vi.mocked(apiClient.post).mockResolvedValueOnce(behandling);

        const svar = await opprettBehandling(payload);

        expect(apiClient.post).toHaveBeenCalledTimes(1);
        expect(apiClient.post).toHaveBeenCalledWith({
            data: payload,
            url: '/familie-ks-sak/api/behandlinger',
        });
        expect(svar).toEqual(behandling);
    });

    test('skal håndtere feil', async () => {
        vi.mocked(apiClient.post).mockRejectedValue(new Error('Noe gikk galt'));

        const payload = {
            kategori: null,
            behandlingType: Behandlingstype.FØRSTEGANGSBEHANDLING,
            behandlingÅrsak: BehandlingÅrsak.SØKNAD,
            saksbehandlerIdent: 'Z123456',
            søkersIdent: '129499012851',
            søknadMottattDato: '2026-08-04',
        };

        await expect(opprettBehandling(payload)).rejects.toThrow('Noe gikk galt');
    });
});
