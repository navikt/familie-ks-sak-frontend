import { useBehandling } from '@hooks/useBehandling';
import { renderHook } from '@testing-library/react';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { BehandlingStatus, BehandlingÅrsak } from '@typer/behandling';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useErBehandlingMedVedtaksbrevbygger } from './useErBehandlingMedVedtaksbrevbygger';

vi.mock('@hooks/useBehandling');

const mockUseBehandling = vi.mocked(useBehandling);

beforeEach(() => {
    vi.resetAllMocks();
    mockUseBehandling.mockReturnValue(lagBehandling());
});

describe('useErBehandlingMedVedtaksbrevbygger', () => {
    it('returnerer true når behandlingen ikke er dødsfall eller avsluttet', () => {
        mockUseBehandling.mockReturnValue(
            lagBehandling({
                årsak: BehandlingÅrsak.SØKNAD,
                status: BehandlingStatus.UTREDES,
            })
        );

        const { result } = renderHook(() => useErBehandlingMedVedtaksbrevbygger());

        expect(result.current).toBe(true);
    });

    it('returnerer false for dødsfall', () => {
        mockUseBehandling.mockReturnValue(
            lagBehandling({
                årsak: BehandlingÅrsak.DØDSFALL,
                status: BehandlingStatus.UTREDES,
            })
        );

        const { result } = renderHook(() => useErBehandlingMedVedtaksbrevbygger());

        expect(result.current).toBe(false);
    });

    it('returnerer false for avsluttet behandling', () => {
        mockUseBehandling.mockReturnValue(
            lagBehandling({
                årsak: BehandlingÅrsak.SØKNAD,
                status: BehandlingStatus.AVSLUTTET,
            })
        );

        const { result } = renderHook(() => useErBehandlingMedVedtaksbrevbygger());

        expect(result.current).toBe(false);
    });

    it('returnerer false for dødsfall og avsluttet behandling', () => {
        mockUseBehandling.mockReturnValue(
            lagBehandling({
                årsak: BehandlingÅrsak.DØDSFALL,
                status: BehandlingStatus.AVSLUTTET,
            })
        );

        const { result } = renderHook(() => useErBehandlingMedVedtaksbrevbygger());

        expect(result.current).toBe(false);
    });
});
