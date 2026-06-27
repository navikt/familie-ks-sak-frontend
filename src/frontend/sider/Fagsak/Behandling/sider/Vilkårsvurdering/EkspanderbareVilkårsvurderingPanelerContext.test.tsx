import { type PropsWithChildren } from 'react';

import { useBehandling } from '@hooks/useBehandling';
import { useErLesevisning } from '@hooks/useErLesevisning';
import {
    EkspanderbareVilkårsvurderingPanelerProvider,
    useEkspanderbareVilkårsvurderingPaneler,
} from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/EkspanderbareVilkårsvurderingPanelerContext';
import { act, renderHook } from '@testing-library/react';
import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { lagPersonResultat } from '@testutils/testdata/personResultatTestdata';
import { lagVilkårResultat } from '@testutils/testdata/vilkårResultatTestdata';
import { Resultat } from '@typer/vilkår';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@hooks/useBehandling', () => ({ useBehandling: vi.fn() }));
vi.mock('@hooks/useErLesevisning', () => ({ useErLesevisning: vi.fn() }));

function Wrapper({ children }: PropsWithChildren) {
    return <EkspanderbareVilkårsvurderingPanelerProvider>{children}</EkspanderbareVilkårsvurderingPanelerProvider>;
}

describe('EkspanderbareVilkårsvurderingPaneler', () => {
    beforeEach(() => {
        vi.mocked(useErLesevisning).mockReturnValue(false);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('useEkspanderbareVilkårsvurderingPaneler utenfor provider', () => {
        test('kaster feil når hooken brukes uten provider', () => {
            // Arrange
            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

            // Act & Assert
            expect(() => renderHook(() => useEkspanderbareVilkårsvurderingPaneler())).toThrow(
                'useEkspanderbareVilkårsvurderingPaneler må brukes innenfor en EkspanderbareVilkårsvurderingPanelerProvider.'
            );

            // Cleanup
            consoleError.mockRestore();
        });
    });

    describe('Initiell ekspandert tilstand', () => {
        test('ekspanderer alle vilkårsvurderinger i lesevisning', () => {
            // Arrange
            vi.mocked(useErLesevisning).mockReturnValue(true);
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandling({
                    personResultater: [
                        lagPersonResultat({
                            personIdent: '1',
                            vilkårResultater: [
                                lagVilkårResultat({
                                    resultat: Resultat.OPPFYLT,
                                }),
                            ],
                        }),
                        lagPersonResultat({
                            personIdent: '2',
                            vilkårResultater: [
                                lagVilkårResultat({
                                    resultat: Resultat.IKKE_OPPFYLT,
                                }),
                            ],
                        }),
                    ],
                })
            );

            // Act
            const { result } = renderHook(() => useEkspanderbareVilkårsvurderingPaneler(), { wrapper: Wrapper });

            // Assert
            expect(result.current.erPanelEkspandert('1')).toBe(true);
            expect(result.current.erPanelEkspandert('2')).toBe(true);
        });

        test('ekspanderer vilkårsvurderinger med minst ett ikke-vurdert vilkår', () => {
            // Arrange
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandling({
                    personResultater: [
                        lagPersonResultat({
                            personIdent: '1',
                            vilkårResultater: [
                                lagVilkårResultat({
                                    resultat: Resultat.OPPFYLT,
                                }),
                                lagVilkårResultat({
                                    resultat: Resultat.IKKE_VURDERT,
                                }),
                            ],
                        }),
                        lagPersonResultat({
                            personIdent: '2',
                            vilkårResultater: [
                                lagVilkårResultat({
                                    resultat: Resultat.OPPFYLT,
                                }),
                            ],
                        }),
                    ],
                })
            );

            // Act
            const { result } = renderHook(() => useEkspanderbareVilkårsvurderingPaneler(), { wrapper: Wrapper });

            // Assert
            expect(result.current.erPanelEkspandert('1')).toBe(true);
            expect(result.current.erPanelEkspandert('2')).toBe(false);
        });
    });

    describe('erPanelEkspandert', () => {
        test('returnerer false for ukjent ident', () => {
            // Arrange
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandling({
                    personResultater: [
                        lagPersonResultat({
                            personIdent: '1',
                            vilkårResultater: [
                                lagVilkårResultat({
                                    resultat: Resultat.OPPFYLT,
                                }),
                            ],
                        }),
                    ],
                })
            );

            // Act
            const { result } = renderHook(() => useEkspanderbareVilkårsvurderingPaneler(), { wrapper: Wrapper });

            // Assert
            expect(result.current.erPanelEkspandert('finnes-ikke')).toBe(false);
        });

        test('returnerer true for et ekspandert panel', () => {
            // Arrange
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandling({
                    personResultater: [
                        lagPersonResultat({
                            personIdent: '1',
                            vilkårResultater: [
                                lagVilkårResultat({
                                    resultat: Resultat.IKKE_VURDERT,
                                }),
                            ],
                        }),
                    ],
                })
            );

            // Act
            const { result } = renderHook(() => useEkspanderbareVilkårsvurderingPaneler(), { wrapper: Wrapper });

            // Assert
            expect(result.current.erPanelEkspandert('1')).toBe(true);
        });

        test('returnerer false for et kollapset panel', () => {
            // Arrange
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandling({
                    personResultater: [
                        lagPersonResultat({
                            personIdent: '1',
                            vilkårResultater: [
                                lagVilkårResultat({
                                    resultat: Resultat.OPPFYLT,
                                }),
                            ],
                        }),
                    ],
                })
            );

            // Act
            const { result } = renderHook(() => useEkspanderbareVilkårsvurderingPaneler(), { wrapper: Wrapper });

            // Assert
            expect(result.current.erPanelEkspandert('1')).toBe(false);
        });
    });

    describe('ekspanderPanel', () => {
        test('ekspanderer panel', () => {
            // Arrange
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandling({
                    personResultater: [
                        lagPersonResultat({
                            personIdent: '1',
                            vilkårResultater: [
                                lagVilkårResultat({
                                    resultat: Resultat.OPPFYLT,
                                }),
                            ],
                        }),
                    ],
                })
            );

            const { result } = renderHook(() => useEkspanderbareVilkårsvurderingPaneler(), { wrapper: Wrapper });

            const eksisterendeTilstand = result.current.erPanelEkspandert('1');

            // Act
            act(() => result.current.ekspanderPanel('1'));

            // Assert
            expect(eksisterendeTilstand).toBe(false);
            expect(result.current.erPanelEkspandert('1')).toBe(true);
        });

        test('ekspandering av panel er idempotent når panelet allerede er ekspandert', () => {
            // Arrange
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandling({
                    personResultater: [
                        lagPersonResultat({
                            personIdent: '1',
                            vilkårResultater: [
                                lagVilkårResultat({
                                    resultat: Resultat.OPPFYLT,
                                }),
                            ],
                        }),
                    ],
                })
            );

            const { result } = renderHook(() => useEkspanderbareVilkårsvurderingPaneler(), { wrapper: Wrapper });

            const eksisterendeTilstand = result.current.erPanelEkspandert('1');

            act(() => result.current.ekspanderPanel('1'));

            // Act
            act(() => result.current.ekspanderPanel('1'));

            // Assert
            expect(eksisterendeTilstand).toBe(false);
            expect(result.current.erPanelEkspandert('1')).toBe(true);
        });

        test('påvirker ikke andre paneler', () => {
            // Arrange
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandling({
                    personResultater: [
                        lagPersonResultat({
                            personIdent: '1',
                            vilkårResultater: [
                                lagVilkårResultat({
                                    resultat: Resultat.OPPFYLT,
                                }),
                            ],
                        }),
                        lagPersonResultat({
                            personIdent: '2',
                            vilkårResultater: [
                                lagVilkårResultat({
                                    resultat: Resultat.OPPFYLT,
                                }),
                            ],
                        }),
                    ],
                })
            );

            const { result } = renderHook(() => useEkspanderbareVilkårsvurderingPaneler(), { wrapper: Wrapper });

            const eksisterendeTilstand = result.current.erPanelEkspandert('2');

            // Act
            act(() => result.current.ekspanderPanel('1'));

            // Assert
            expect(eksisterendeTilstand).toBe(false);
            expect(result.current.erPanelEkspandert('2')).toBe(false);
        });
    });

    describe('kollapsPanel', () => {
        test('kollapser et ekspandert panel', () => {
            // Arrange
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandling({
                    personResultater: [
                        lagPersonResultat({
                            personIdent: '1',
                            vilkårResultater: [
                                lagVilkårResultat({
                                    resultat: Resultat.IKKE_VURDERT,
                                }),
                            ],
                        }),
                    ],
                })
            );

            const { result } = renderHook(() => useEkspanderbareVilkårsvurderingPaneler(), { wrapper: Wrapper });

            const eksisterendeTilstand = result.current.erPanelEkspandert('1');

            // Act
            act(() => result.current.kollapsPanel('1'));

            // Assert
            expect(eksisterendeTilstand).toBe(true);
            expect(result.current.erPanelEkspandert('1')).toBe(false);
        });

        test('kollapsing av et panel er idempotent når panelet allerede er kollapset', () => {
            // Arrange
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandling({
                    personResultater: [
                        lagPersonResultat({
                            personIdent: '1',
                            vilkårResultater: [
                                lagVilkårResultat({
                                    resultat: Resultat.OPPFYLT,
                                }),
                            ],
                        }),
                    ],
                })
            );

            const { result } = renderHook(() => useEkspanderbareVilkårsvurderingPaneler(), { wrapper: Wrapper });

            const eksisterendeTilstand = result.current.erPanelEkspandert('1');

            // Act
            act(() => result.current.kollapsPanel('1'));

            // Assert
            expect(eksisterendeTilstand).toBe(false);
            expect(result.current.erPanelEkspandert('1')).toBe(false);
        });

        test('påvirker ikke andre paneler', () => {
            // Arrange
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandling({
                    personResultater: [
                        lagPersonResultat({
                            personIdent: '1',
                            vilkårResultater: [
                                lagVilkårResultat({
                                    resultat: Resultat.IKKE_VURDERT,
                                }),
                            ],
                        }),
                        lagPersonResultat({
                            personIdent: '2',
                            vilkårResultater: [
                                lagVilkårResultat({
                                    resultat: Resultat.IKKE_VURDERT,
                                }),
                            ],
                        }),
                    ],
                })
            );

            const { result } = renderHook(() => useEkspanderbareVilkårsvurderingPaneler(), { wrapper: Wrapper });

            const eksisterendeTilstand = result.current.erPanelEkspandert('2');

            // Act
            act(() => result.current.kollapsPanel('1'));

            // Assert
            expect(eksisterendeTilstand).toBe(true);
            expect(result.current.erPanelEkspandert('2')).toBe(true);
        });
    });

    describe('togglePanel', () => {
        test('ekspanderer et kollapset panel', () => {
            // Arrange
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandling({
                    personResultater: [
                        lagPersonResultat({
                            personIdent: '1',
                            vilkårResultater: [
                                lagVilkårResultat({
                                    resultat: Resultat.OPPFYLT,
                                }),
                            ],
                        }),
                    ],
                })
            );

            const { result } = renderHook(() => useEkspanderbareVilkårsvurderingPaneler(), { wrapper: Wrapper });

            const eksisterendeTilstand = result.current.erPanelEkspandert('1');

            // Act
            act(() => result.current.togglePanel('1'));

            // Assert
            expect(eksisterendeTilstand).toBe(false);
            expect(result.current.erPanelEkspandert('1')).toBe(true);
        });

        test('kollapser et ekspandert panel', () => {
            // Arrange
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandling({
                    personResultater: [
                        lagPersonResultat({
                            personIdent: '1',
                            vilkårResultater: [
                                lagVilkårResultat({
                                    resultat: Resultat.IKKE_VURDERT,
                                }),
                            ],
                        }),
                    ],
                })
            );

            const { result } = renderHook(() => useEkspanderbareVilkårsvurderingPaneler(), { wrapper: Wrapper });

            const eksisterendeTilstand = result.current.erPanelEkspandert('1');

            // Act
            act(() => result.current.togglePanel('1'));

            // Assert
            expect(eksisterendeTilstand).toBe(true);
            expect(result.current.erPanelEkspandert('1')).toBe(false);
        });

        test('veksler tilbake til opprinnelig tilstand etter to kall', () => {
            // Arrange
            vi.mocked(useBehandling).mockReturnValue(
                lagBehandling({
                    personResultater: [
                        lagPersonResultat({
                            personIdent: '1',
                            vilkårResultater: [
                                lagVilkårResultat({
                                    resultat: Resultat.OPPFYLT,
                                }),
                            ],
                        }),
                    ],
                })
            );

            const { result } = renderHook(() => useEkspanderbareVilkårsvurderingPaneler(), { wrapper: Wrapper });

            act(() => result.current.togglePanel('1'));

            // Act
            act(() => result.current.togglePanel('1'));

            // Assert
            expect(result.current.erPanelEkspandert('1')).toBe(false);
        });
    });
});
