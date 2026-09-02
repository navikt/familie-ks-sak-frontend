import { useBehandling } from '@hooks/useBehandling';
import { renderHook } from '@testing-library/react';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { Behandlingstype, BehandlingÅrsak } from '@typer/behandling';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useErBehandlingMedVedtaksbrev } from './useErBehandlingMedVedtaksbrev';

vi.mock('@hooks/useBehandling');

const mockUseBehandling = vi.mocked(useBehandling);

beforeEach(() => {
    vi.resetAllMocks();
    mockUseBehandling.mockReturnValue(lagBehandling());
});

describe('useErBehandlingMedVedtaksbrev', () => {
    it('returnerer true for søknad', () => {
        mockUseBehandling.mockReturnValue(
            lagBehandling({
                type: Behandlingstype.FØRSTEGANGSBEHANDLING,
                årsak: BehandlingÅrsak.SØKNAD,
            })
        );

        const { result } = renderHook(() => useErBehandlingMedVedtaksbrev());

        expect(result.current).toBe(true);
    });

    it('returnerer false for satsendring', () => {
        mockUseBehandling.mockReturnValue(
            lagBehandling({
                type: Behandlingstype.REVURDERING,
                årsak: BehandlingÅrsak.SATSENDRING,
            })
        );

        const { result } = renderHook(() => useErBehandlingMedVedtaksbrev());

        expect(result.current).toBe(false);
    });

    it('returnerer false for iverksette KA-vedtak', () => {
        mockUseBehandling.mockReturnValue(
            lagBehandling({
                type: Behandlingstype.REVURDERING,
                årsak: BehandlingÅrsak.IVERKSETTE_KA_VEDTAK,
            })
        );

        const { result } = renderHook(() => useErBehandlingMedVedtaksbrev());

        expect(result.current).toBe(false);
    });

    it('returnerer false for teknisk endring', () => {
        mockUseBehandling.mockReturnValue(
            lagBehandling({
                type: Behandlingstype.TEKNISK_ENDRING,
                årsak: BehandlingÅrsak.SØKNAD,
            })
        );

        const { result } = renderHook(() => useErBehandlingMedVedtaksbrev());

        expect(result.current).toBe(false);
    });

    it('returnerer false for teknisk endring og årsak satsendring', () => {
        mockUseBehandling.mockReturnValue(
            lagBehandling({
                type: Behandlingstype.TEKNISK_ENDRING,
                årsak: BehandlingÅrsak.SATSENDRING,
            })
        );

        const { result } = renderHook(() => useErBehandlingMedVedtaksbrev());

        expect(result.current).toBe(false);
    });

    it('returnerer false for teknisk endring og årsak iverksette KA-vedtak', () => {
        mockUseBehandling.mockReturnValue(
            lagBehandling({
                type: Behandlingstype.TEKNISK_ENDRING,
                årsak: BehandlingÅrsak.IVERKSETTE_KA_VEDTAK,
            })
        );

        const { result } = renderHook(() => useErBehandlingMedVedtaksbrev());

        expect(result.current).toBe(false);
    });

    it('returnerer true for dødsfall', () => {
        mockUseBehandling.mockReturnValue(
            lagBehandling({
                type: Behandlingstype.REVURDERING,
                årsak: BehandlingÅrsak.DØDSFALL,
            })
        );

        const { result } = renderHook(() => useErBehandlingMedVedtaksbrev());

        expect(result.current).toBe(true);
    });
});
