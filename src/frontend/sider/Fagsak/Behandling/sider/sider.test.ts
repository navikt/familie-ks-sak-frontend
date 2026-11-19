import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { BehandlingSteg, BehandlingStegStatus, BehandlingÅrsak } from '@typer/behandling';
import { describe, expect, test } from 'vitest';

import { finnSideForBehandlingssteg, finnSiderForBehandling, SideId, sider } from './sider';

describe('Sider', () => {
    describe('finnSiderForBehandling', () => {
        test('skal vise alle sider for en ordinær søknadsbehandling', () => {
            const behandling = lagBehandling();

            const sideIder = finnSiderForBehandling(behandling).map(side => side.id);

            expect(sideIder).toEqual([
                SideId.REGISTRERE_SØKNAD,
                SideId.VILKÅRSVURDERING,
                SideId.BEHANDLINGRESULTAT,
                SideId.SIMULERING,
                SideId.VEDTAK,
            ]);
        });

        test('skal skjule registrer søknad og vedtak ved satsendring', () => {
            const behandling = lagBehandling({ årsak: BehandlingÅrsak.SATSENDRING });

            const sideIder = finnSiderForBehandling(behandling).map(side => side.id);

            expect(sideIder).toEqual([SideId.VILKÅRSVURDERING, SideId.BEHANDLINGRESULTAT, SideId.SIMULERING]);
        });

        test('skal skjule simulering og vedtak ved lovendring 2024 når behandlingen mangler stegene for simulering og vedtak', () => {
            const behandling = lagBehandling({
                årsak: BehandlingÅrsak.LOVENDRING_2024,
                stegTilstand: [],
            });

            const sideIder = finnSiderForBehandling(behandling).map(side => side.id);

            expect(sideIder).toEqual([SideId.VILKÅRSVURDERING, SideId.BEHANDLINGRESULTAT]);
        });

        test('skal vise simulering og vedtak ved lovendring 2024 når behandlingen har stegene for simulering og vedtak', () => {
            const behandling = lagBehandling({
                årsak: BehandlingÅrsak.LOVENDRING_2024,
                stegTilstand: [
                    { behandlingSteg: BehandlingSteg.SIMULERING, behandlingStegStatus: BehandlingStegStatus.UTFØRT },
                    { behandlingSteg: BehandlingSteg.VEDTAK, behandlingStegStatus: BehandlingStegStatus.UTFØRT },
                ],
            });

            const sideIder = finnSiderForBehandling(behandling).map(side => side.id);

            expect(sideIder).toEqual([
                SideId.VILKÅRSVURDERING,
                SideId.BEHANDLINGRESULTAT,
                SideId.SIMULERING,
                SideId.VEDTAK,
            ]);
        });

        test('skal vise simulering, men skjule vedtak, ved lovendring 2024 når kun simuleringssteget finnes', () => {
            const behandling = lagBehandling({
                årsak: BehandlingÅrsak.LOVENDRING_2024,
                stegTilstand: [
                    { behandlingSteg: BehandlingSteg.SIMULERING, behandlingStegStatus: BehandlingStegStatus.UTFØRT },
                ],
            });

            const sideIder = finnSiderForBehandling(behandling).map(side => side.id);

            expect(sideIder).toEqual([SideId.VILKÅRSVURDERING, SideId.BEHANDLINGRESULTAT, SideId.SIMULERING]);
        });

        test('skal vise vedtak, men skjule simulering, ved lovendring 2024 når kun vedtakssteget finnes', () => {
            const behandling = lagBehandling({
                årsak: BehandlingÅrsak.LOVENDRING_2024,
                stegTilstand: [
                    { behandlingSteg: BehandlingSteg.VEDTAK, behandlingStegStatus: BehandlingStegStatus.UTFØRT },
                ],
            });

            const sideIder = finnSiderForBehandling(behandling).map(side => side.id);

            expect(sideIder).toEqual([SideId.VILKÅRSVURDERING, SideId.BEHANDLINGRESULTAT, SideId.VEDTAK]);
        });
    });

    describe('finnSideForBehandlingssteg', () => {
        test(
            'skal returnere Vedtak-siden dersom behandlingssteget er etter "send til beslutter" ' +
                'og behandlingsårsaken ikke er "satsendring"',
            () => {
                const behandling = lagBehandling({
                    årsak: BehandlingÅrsak.SØKNAD,
                    steg: BehandlingSteg.AVSLUTT_BEHANDLING,
                });
                expect(finnSideForBehandlingssteg(behandling)).toEqual(sider.VEDTAK);
            }
        );

        test(
            'skal returnere Simulering-siden dersom behandlingssteget er etter "send til beslutter" ' +
                'og behandlingsårsaken er "satsendring"',
            () => {
                const behandling = lagBehandling({
                    årsak: BehandlingÅrsak.SATSENDRING,
                    steg: BehandlingSteg.AVSLUTT_BEHANDLING,
                });
                expect(finnSideForBehandlingssteg(behandling)).toEqual(sider.SIMULERING);
            }
        );

        test.each([
            [BehandlingSteg.REGISTRERE_SØKNAD, sider.REGISTRERE_SØKNAD],
            [BehandlingSteg.VILKÅRSVURDERING, sider.VILKÅRSVURDERING],
            [BehandlingSteg.BEHANDLINGSRESULTAT, sider.BEHANDLINGRESULTAT],
            [BehandlingSteg.SIMULERING, sider.SIMULERING],
            [BehandlingSteg.VEDTAK, sider.VEDTAK],
        ])('skal returnere siden som tilhører steget %s', (steg, forventetSide) => {
            const behandling = lagBehandling({ årsak: BehandlingÅrsak.SØKNAD, steg });
            expect(finnSideForBehandlingssteg(behandling)).toEqual(forventetSide);
        });

        test('skal returnere undefined dersom steget ikke har en egen side', () => {
            const behandling = lagBehandling({ steg: BehandlingSteg.REGISTRERE_PERSONGRUNNLAG });
            expect(finnSideForBehandlingssteg(behandling)).toBeUndefined();
        });

        test('skal returnere undefined dersom siden for steget er skjult for behandlingen', () => {
            const behandling = lagBehandling({
                årsak: BehandlingÅrsak.NYE_OPPLYSNINGER,
                steg: BehandlingSteg.REGISTRERE_SØKNAD,
            });
            expect(finnSideForBehandlingssteg(behandling)).toBeUndefined();
        });

        test('skal returnere Simulering-siden ved lovendring uten vedtakssteg', () => {
            const behandling = lagBehandling({
                årsak: BehandlingÅrsak.LOVENDRING_2024,
                steg: BehandlingSteg.AVSLUTT_BEHANDLING,
                stegTilstand: [
                    { behandlingSteg: BehandlingSteg.SIMULERING, behandlingStegStatus: BehandlingStegStatus.UTFØRT },
                ],
            });
            expect(finnSideForBehandlingssteg(behandling)).toEqual(sider.SIMULERING);
        });

        test('skal returnere Behandlingsresultat-siden ved lovendring uten simulerings- og vedtakssteg', () => {
            const behandling = lagBehandling({
                årsak: BehandlingÅrsak.LOVENDRING_2024,
                steg: BehandlingSteg.AVSLUTT_BEHANDLING,
                stegTilstand: [
                    {
                        behandlingSteg: BehandlingSteg.BEHANDLINGSRESULTAT,
                        behandlingStegStatus: BehandlingStegStatus.UTFØRT,
                    },
                ],
            });
            expect(finnSideForBehandlingssteg(behandling)).toEqual(sider.BEHANDLINGRESULTAT);
        });
    });
});
