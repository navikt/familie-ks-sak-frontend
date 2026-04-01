import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useSaksbehandler } from './useSaksbehandler';
import { useSaksbehandlerContext } from '../context/SaksbehandlerContext';
import { lagSaksbehandler } from '../testutils/testdata/saksbehandlerTestdata';
import { BehandlerRolle } from '../typer/behandling';

vi.mock('../context/SaksbehandlerContext', () => ({
    useSaksbehandlerContext: vi.fn(),
}));

describe('useSaksbehandler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('skal hente saksbehandler med skrivetilgang', () => {
        // Arrange
        const saksbehandler = lagSaksbehandler();

        vi.mocked(useSaksbehandlerContext).mockReturnValue({ saksbehandler });

        // Act
        const { result } = renderHook(() => useSaksbehandler());

        // Assert
        expect(result.current.displayName).toBe('Sak Behandler');
        expect(result.current.email).toBe('saksbehandler@nav.no');
        expect(result.current.firstName).toBe('Sak');
        expect(result.current.groups).toStrictEqual(['c7e0b108-7ae6-432c-9ab4-946174c240c0']);
        expect(result.current.identifier).toBe('30987654321');
        expect(result.current.lastName).toBe('Behandler');
        expect(result.current.enhet).toBe('0001');
        expect(result.current.navIdent).toBe('A1');
        expect(result.current.rolle).toBe(BehandlerRolle.SAKSBEHANDLER);
        expect(result.current.harSkrivetilgang).toBe(true);
        expect(result.current.harSuperbrukertilgang).toBe(false);
    });

    it('skal hente saksbehandler med skrivetilgang og superbrukertilgang', () => {
        // Arrange
        const grupper = ['c7e0b108-7ae6-432c-9ab4-946174c240c0', '314fa714-f13c-4cdc-ac5c-e13ce08e241c'];
        const saksbehandler = lagSaksbehandler({ groups: grupper });

        vi.mocked(useSaksbehandlerContext).mockReturnValue({ saksbehandler });

        // Act
        const { result } = renderHook(() => useSaksbehandler());

        // Assert
        expect(result.current.displayName).toBe('Sak Behandler');
        expect(result.current.email).toBe('saksbehandler@nav.no');
        expect(result.current.firstName).toBe('Sak');
        expect(result.current.groups).toStrictEqual(grupper);
        expect(result.current.identifier).toBe('30987654321');
        expect(result.current.lastName).toBe('Behandler');
        expect(result.current.enhet).toBe('0001');
        expect(result.current.navIdent).toBe('A1');
        expect(result.current.rolle).toBe(BehandlerRolle.SAKSBEHANDLER);
        expect(result.current.harSkrivetilgang).toBe(true);
        expect(result.current.harSuperbrukertilgang).toBe(true);
    });

    it('skal hente saksbehandler uten skrivetilgang eller superbrukertilgang', () => {
        // Arrange
        const grupper = ['71f503a2-c28f-4394-a05a-8da263ceca4a'];
        const saksbehandler = lagSaksbehandler({ groups: grupper });

        vi.mocked(useSaksbehandlerContext).mockReturnValue({ saksbehandler });

        // Act
        const { result } = renderHook(() => useSaksbehandler());

        // Assert
        expect(result.current.displayName).toBe('Sak Behandler');
        expect(result.current.email).toBe('saksbehandler@nav.no');
        expect(result.current.firstName).toBe('Sak');
        expect(result.current.groups).toStrictEqual(grupper);
        expect(result.current.identifier).toBe('30987654321');
        expect(result.current.lastName).toBe('Behandler');
        expect(result.current.enhet).toBe('0001');
        expect(result.current.navIdent).toBe('A1');
        expect(result.current.rolle).toBe(BehandlerRolle.VEILEDER);
        expect(result.current.harSkrivetilgang).toBe(false);
        expect(result.current.harSuperbrukertilgang).toBe(false);
    });
});
