import { renderHook } from '@testing-library/react';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { BehandlingSteg, BehandlingÅrsak } from '@typer/behandling';
import type { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router';

import { useErViPåUgyldigSideForBehandling } from './useErViPåUgyldigSideForBehandling';

function lagWrapper(pathname: string) {
    return ({ children }: PropsWithChildren) => <MemoryRouter initialEntries={[{ pathname }]}>{children}</MemoryRouter>;
}

describe('useErViPåUgyldigSideForBehandling', () => {
    test('skal returnere true når saksbehandler er på en side som er skjult for behandlingen', () => {
        const behandling = lagBehandling({
            årsak: BehandlingÅrsak.NYE_OPPLYSNINGER,
            steg: BehandlingSteg.VILKÅRSVURDERING,
        });

        const { result } = renderHook(() => useErViPåUgyldigSideForBehandling(behandling), {
            wrapper: lagWrapper('/fagsak/1/1/registrer-soknad'),
        });

        expect(result.current).toBe(true);
    });

    test('skal returnere true når saksbehandler er på et steg etter behandlingens steg', () => {
        const behandling = lagBehandling({ steg: BehandlingSteg.VILKÅRSVURDERING });

        const { result } = renderHook(() => useErViPåUgyldigSideForBehandling(behandling), {
            wrapper: lagWrapper('/fagsak/1/1/vedtak'),
        });

        expect(result.current).toBe(true);
    });

    test('skal returnere true når saksbehandler er på en udefinert fagsakside', () => {
        const behandling = lagBehandling({ steg: BehandlingSteg.VILKÅRSVURDERING });

        const { result } = renderHook(() => useErViPåUgyldigSideForBehandling(behandling), {
            wrapper: lagWrapper('/fagsak/1/1/finnes-ikke'),
        });

        expect(result.current).toBe(true);
    });

    test('skal returnere true når behandlingens steg ikke har en egen side', () => {
        const behandling = lagBehandling({ steg: BehandlingSteg.REGISTRERE_PERSONGRUNNLAG });

        const { result } = renderHook(() => useErViPåUgyldigSideForBehandling(behandling), {
            wrapper: lagWrapper('/fagsak/1/1/vilkaarsvurdering'),
        });

        expect(result.current).toBe(true);
    });

    test('skal returnere true når siden for behandlingens steg er skjult for behandlingen', () => {
        const behandling = lagBehandling({
            årsak: BehandlingÅrsak.NYE_OPPLYSNINGER,
            steg: BehandlingSteg.REGISTRERE_SØKNAD,
        });

        const { result } = renderHook(() => useErViPåUgyldigSideForBehandling(behandling), {
            wrapper: lagWrapper('/fagsak/1/1/vilkaarsvurdering'),
        });

        expect(result.current).toBe(true);
    });

    test('skal returnere false når saksbehandler er på behandlingens steg', () => {
        const behandling = lagBehandling({ steg: BehandlingSteg.VILKÅRSVURDERING });

        const { result } = renderHook(() => useErViPåUgyldigSideForBehandling(behandling), {
            wrapper: lagWrapper('/fagsak/1/1/vilkaarsvurdering'),
        });

        expect(result.current).toBe(false);
    });

    test('skal returnere false når saksbehandler er på et tidligere steg', () => {
        const behandling = lagBehandling({ steg: BehandlingSteg.VILKÅRSVURDERING });

        const { result } = renderHook(() => useErViPåUgyldigSideForBehandling(behandling), {
            wrapper: lagWrapper('/fagsak/1/1/registrer-soknad'),
        });

        expect(result.current).toBe(false);
    });

    test('skal returnere true når saksbehandler ikke er på en side', () => {
        const behandling = lagBehandling({ steg: BehandlingSteg.VILKÅRSVURDERING });

        const { result } = renderHook(() => useErViPåUgyldigSideForBehandling(behandling), {
            wrapper: lagWrapper('/fagsak/1/1'),
        });

        expect(result.current).toBe(true);
    });

    test('skal returnere false når saksbehandler er på en underside av behandlingens steg', () => {
        const behandling = lagBehandling({ steg: BehandlingSteg.VILKÅRSVURDERING });

        const { result } = renderHook(() => useErViPåUgyldigSideForBehandling(behandling), {
            wrapper: lagWrapper('/fagsak/1/1/vilkaarsvurdering/underside'),
        });

        expect(result.current).toBe(false);
    });

    test('skal returnere false når saksbehandler er på vedtak og behandlingen er forbi vedtakssteget', () => {
        const behandling = lagBehandling({ steg: BehandlingSteg.BESLUTTE_VEDTAK });

        const { result } = renderHook(() => useErViPåUgyldigSideForBehandling(behandling), {
            wrapper: lagWrapper('/fagsak/1/1/vedtak'),
        });

        expect(result.current).toBe(false);
    });

    test('skal returnere true når saksbehandler er på vedtak i en satsendring', () => {
        const behandling = lagBehandling({
            årsak: BehandlingÅrsak.SATSENDRING,
            steg: BehandlingSteg.BESLUTTE_VEDTAK,
        });

        const { result } = renderHook(() => useErViPåUgyldigSideForBehandling(behandling), {
            wrapper: lagWrapper('/fagsak/1/1/vedtak'),
        });

        expect(result.current).toBe(true);
    });

    test('skal returnere false når saksbehandler er på simulering i en satsendring forbi vedtakssteget', () => {
        const behandling = lagBehandling({
            årsak: BehandlingÅrsak.SATSENDRING,
            steg: BehandlingSteg.BESLUTTE_VEDTAK,
        });

        const { result } = renderHook(() => useErViPåUgyldigSideForBehandling(behandling), {
            wrapper: lagWrapper('/fagsak/1/1/simulering'),
        });

        expect(result.current).toBe(false);
    });

    test('skal returnere true når saksbehandler er på simulering i en lovendring uten simuleringssteg', () => {
        const behandling = lagBehandling({
            årsak: BehandlingÅrsak.LOVENDRING_2024,
            steg: BehandlingSteg.BESLUTTE_VEDTAK,
            stegTilstand: [],
        });

        const { result } = renderHook(() => useErViPåUgyldigSideForBehandling(behandling), {
            wrapper: lagWrapper('/fagsak/1/1/simulering'),
        });

        expect(result.current).toBe(true);
    });

    test('skal returnere false når saksbehandler er på behandlingsresultat i en lovendring uten simuleringssteg', () => {
        const behandling = lagBehandling({
            årsak: BehandlingÅrsak.LOVENDRING_2024,
            steg: BehandlingSteg.BESLUTTE_VEDTAK,
            stegTilstand: [],
        });

        const { result } = renderHook(() => useErViPåUgyldigSideForBehandling(behandling), {
            wrapper: lagWrapper('/fagsak/1/1/tilkjent-ytelse'),
        });

        expect(result.current).toBe(false);
    });
});
