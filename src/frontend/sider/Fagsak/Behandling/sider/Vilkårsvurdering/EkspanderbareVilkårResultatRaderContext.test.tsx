import type { PropsWithChildren } from 'react';

import { useBehandling } from '@hooks/useBehandling';
import { useErLesevisning } from '@hooks/useErLesevisning';
import { act, renderHook } from '@testing-library/react';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { lagPersonResultat } from '@testutils/testdata/personResultatTestdata';
import { lagVilkårResultat } from '@testutils/testdata/vilkårResultatTestdata';
import { Resultat } from '@typer/vilkår';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
    EkspanderbareVilkårResultatRaderProvider,
    useEkspanderbareVilkårResultatRader,
    useEkspanderbarVilkårResultatRad,
} from './EkspanderbareVilkårResultatRaderContext';

vi.mock('@hooks/useBehandling');
vi.mock('@hooks/useErLesevisning');
vi.mock('@typer/behandling');

function lagBehandlingMedVilkår(...vilkårResultater: ReturnType<typeof lagVilkårResultat>[]) {
    return lagBehandling({
        personResultater: [lagPersonResultat({ vilkårResultater })],
    });
}

function renderMedProvider<T>(hook: () => T) {
    return renderHook(hook, {
        wrapper: ({ children }: PropsWithChildren) => (
            <EkspanderbareVilkårResultatRaderProvider>{children}</EkspanderbareVilkårResultatRaderProvider>
        ),
    });
}

const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);

beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useErLesevisning).mockReturnValue(false);
    vi.mocked(useBehandling).mockReturnValue(lagBehandling());
});

describe('EkspanderbareVilkårResultatRader', () => {
    describe('initiell ekspandering av rader', () => {
        test('ekspanderer alle vilkårresultater i lesevisning', () => {
            vi.mocked(useErLesevisning).mockReturnValue(true);
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandlingMedVilkår(
                    lagVilkårResultat({ id: 1, resultat: Resultat.OPPFYLT }),
                    lagVilkårResultat({ id: 2, resultat: Resultat.IKKE_VURDERT })
                )
            );

            const { result } = renderMedProvider(() => useEkspanderbareVilkårResultatRader());

            expect(result.current.erRadEkspandert(1)).toBe(true);
            expect(result.current.erRadEkspandert(2)).toBe(true);
        });

        test('ekspanderer ikke vurdert vilkår resultat når lesevisning er false', () => {
            vi.mocked(useErLesevisning).mockReturnValue(false);
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandlingMedVilkår(
                    lagVilkårResultat({ id: 1, resultat: Resultat.OPPFYLT }),
                    lagVilkårResultat({ id: 2, resultat: Resultat.IKKE_VURDERT })
                )
            );

            const { result } = renderMedProvider(() => useEkspanderbareVilkårResultatRader());

            expect(result.current.erRadEkspandert(1)).toBe(false);
            expect(result.current.erRadEkspandert(2)).toBe(true);
        });
    });

    describe('ekspandering av en rad', () => {
        beforeEach(() => {
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandlingMedVilkår(lagVilkårResultat({ id: 1, resultat: Resultat.OPPFYLT }))
            );
        });

        test('ekspanderer en kollapset rad', () => {
            const { result } = renderMedProvider(() => useEkspanderbareVilkårResultatRader());
            expect(result.current.erRadEkspandert(1)).toBe(false);

            act(() => result.current.ekspanderRad(1));

            expect(result.current.erRadEkspandert(1)).toBe(true);
            expect(alertSpy).not.toHaveBeenCalled();
        });

        test('ekspanderer ikke raden og varsler når den har ulagrede endringer', () => {
            const { result } = renderMedProvider(() => useEkspanderbareVilkårResultatRader());

            act(() => result.current.ekspanderRad(1, true));

            expect(result.current.erRadEkspandert(1)).toBe(false);
            expect(alertSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('kollaps av en rad', () => {
        test('kollapser en ekspandert rad', () => {
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandlingMedVilkår(lagVilkårResultat({ id: 1, resultat: Resultat.IKKE_VURDERT }))
            );
            const { result } = renderMedProvider(() => useEkspanderbareVilkårResultatRader());
            expect(result.current.erRadEkspandert(1)).toBe(true);

            act(() => result.current.kollapsRad(1));

            expect(result.current.erRadEkspandert(1)).toBe(false);
            expect(alertSpy).not.toHaveBeenCalled();
        });

        test('kollapser ikke en ekspandert rad med ulagrede endringer', () => {
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandlingMedVilkår(lagVilkårResultat({ id: 1, resultat: Resultat.IKKE_VURDERT }))
            );
            const { result } = renderMedProvider(() => useEkspanderbareVilkårResultatRader());

            act(() => result.current.kollapsRad(1, true));

            expect(result.current.erRadEkspandert(1)).toBe(true);
            expect(alertSpy).toHaveBeenCalledTimes(1);
        });

        test('varsler ikke ved kollaps av en allerede kollapset rad selv med ulagrede endringer', () => {
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandlingMedVilkår(lagVilkårResultat({ id: 1, resultat: Resultat.OPPFYLT }))
            );
            const { result } = renderMedProvider(() => useEkspanderbareVilkårResultatRader());
            expect(result.current.erRadEkspandert(1)).toBe(false);

            act(() => result.current.kollapsRad(1, true));

            expect(result.current.erRadEkspandert(1)).toBe(false);
            expect(alertSpy).not.toHaveBeenCalled();
        });
    });

    describe('veksling (toggle) av en rad', () => {
        test('veksler en kollapset rad til ekspandert', () => {
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandlingMedVilkår(lagVilkårResultat({ id: 1, resultat: Resultat.OPPFYLT }))
            );
            const { result } = renderMedProvider(() => useEkspanderbareVilkårResultatRader());
            expect(result.current.erRadEkspandert(1)).toBe(false);

            act(() => result.current.toggleRad(1));

            expect(result.current.erRadEkspandert(1)).toBe(true);
        });

        test('veksler en ekspandert rad til kollapset', () => {
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandlingMedVilkår(lagVilkårResultat({ id: 1, resultat: Resultat.IKKE_VURDERT }))
            );
            const { result } = renderMedProvider(() => useEkspanderbareVilkårResultatRader());
            expect(result.current.erRadEkspandert(1)).toBe(true);

            act(() => result.current.toggleRad(1));

            expect(result.current.erRadEkspandert(1)).toBe(false);
        });

        test('veksler ikke en ekspandert rad med ulagrede endringer', () => {
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandlingMedVilkår(lagVilkårResultat({ id: 1, resultat: Resultat.IKKE_VURDERT }))
            );
            const { result } = renderMedProvider(() => useEkspanderbareVilkårResultatRader());

            act(() => result.current.toggleRad(1, true));

            expect(result.current.erRadEkspandert(1)).toBe(true);
            expect(alertSpy).toHaveBeenCalledTimes(1);
        });

        test('veksler en kollapset rad til ekspandert uten å varsle selv med ulagrede endringer', () => {
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandlingMedVilkår(lagVilkårResultat({ id: 1, resultat: Resultat.OPPFYLT }))
            );
            const { result } = renderMedProvider(() => useEkspanderbareVilkårResultatRader());

            act(() => result.current.toggleRad(1, true));

            expect(result.current.erRadEkspandert(1)).toBe(true);
            expect(alertSpy).not.toHaveBeenCalled();
        });
    });

    describe('useEkspanderbarVilkårResultatRad for en enkelt rad', () => {
        test('returnerer ekspandert tilstand og bundne funksjoner for raden', () => {
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandlingMedVilkår(lagVilkårResultat({ id: 1, resultat: Resultat.IKKE_VURDERT }))
            );
            const { result } = renderMedProvider(() => useEkspanderbarVilkårResultatRad(1));
            expect(result.current.erRadEkspandert).toBe(true);

            act(() => result.current.kollapsRad());
            expect(result.current.erRadEkspandert).toBe(false);

            act(() => result.current.ekspanderRad());
            expect(result.current.erRadEkspandert).toBe(true);

            act(() => result.current.toggleRad());
            expect(result.current.erRadEkspandert).toBe(false);
        });

        test('varsler og beholder tilstanden når en ekspandert rad har ulagrede endringer', () => {
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandlingMedVilkår(lagVilkårResultat({ id: 1, resultat: Resultat.IKKE_VURDERT }))
            );
            const { result } = renderMedProvider(() => useEkspanderbarVilkårResultatRad(1));

            act(() => result.current.kollapsRad(true));

            expect(result.current.erRadEkspandert).toBe(true);
            expect(alertSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('bruk utenfor provider', () => {
        test('kaster feil når hooken brukes uten provider', () => {
            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

            expect(() => renderHook(() => useEkspanderbareVilkårResultatRader())).toThrow(
                'useVilkårResultatPaneler må brukes innenfor en VilkårResultatPanelerProvider.'
            );

            consoleError.mockRestore();
        });
    });
});
