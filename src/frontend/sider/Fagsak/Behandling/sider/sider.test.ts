import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { BehandlingSteg, BehandlingStegStatus, BehandlingÅrsak } from '@typer/behandling';

import {
    erViPåUdefinertFagsakSide,
    erViPåUlovligSteg,
    finnSideForBehandlingssteg,
    finnSiderForBehandling,
    SideId,
    sider,
} from './sider';

describe('Sider', () => {
    describe('finnSiderForBehandling', () => {
        test('viser alle sider for en ordinær søknadsbehandling', () => {
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

        test('skjuler registrer søknad og vedtak ved satsendring', () => {
            const behandling = lagBehandling({ årsak: BehandlingÅrsak.SATSENDRING });

            const sideIder = finnSiderForBehandling(behandling).map(side => side.id);

            expect(sideIder).toEqual([SideId.VILKÅRSVURDERING, SideId.BEHANDLINGRESULTAT, SideId.SIMULERING]);
        });

        test('skjuler simulering og vedtak ved lovendring 2024 hvor behandling mangler stegene for simulering og vedtak', () => {
            const behandling = lagBehandling({
                årsak: BehandlingÅrsak.LOVENDRING_2024,
                stegTilstand: [
                    {
                        behandlingSteg: BehandlingSteg.REGISTRERE_SØKNAD,
                        behandlingStegStatus: BehandlingStegStatus.IKKE_UTFØRT,
                    },
                ],
            });

            const sideIder = finnSiderForBehandling(behandling).map(side => side.id);

            expect(sideIder).toEqual([SideId.VILKÅRSVURDERING, SideId.BEHANDLINGRESULTAT]);
        });

        test('viser simulering og vedtak ved lovendring 2024 når behandlingen har stegene for simulering og vedtak', () => {
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

        test('viser simulering, men skjuler vedtak, ved lovendring 2024 når kun simuleringssteget finnes', () => {
            const behandling = lagBehandling({
                årsak: BehandlingÅrsak.LOVENDRING_2024,
                stegTilstand: [
                    {
                        behandlingSteg: BehandlingSteg.SIMULERING,
                        behandlingStegStatus: BehandlingStegStatus.UTFØRT,
                    },
                ],
            });

            const sideIder = finnSiderForBehandling(behandling).map(side => side.id);

            expect(sideIder).toEqual([SideId.VILKÅRSVURDERING, SideId.BEHANDLINGRESULTAT, SideId.SIMULERING]);
        });
    });

    describe('Sjekk ved endring av sider', () => {
        test('Oppdater siderForBehandling-tester ved nye/fjernede sider', () => {
            const sider = [
                SideId.REGISTRERE_SØKNAD,
                SideId.VILKÅRSVURDERING,
                SideId.BEHANDLINGRESULTAT,
                SideId.SIMULERING,
                SideId.VEDTAK,
            ];
            expect(Object.values(SideId)).toEqual(sider);
        });
    });

    describe('erViPåUdefinertFagsakSide', () => {
        test('Skal returnere false dersom den får inn en kjent side og true ved ukjent', () => {
            const testUrl = 'test-url/';
            Object.values(sider)
                .map(side => side.href)
                .forEach(sideUrl => expect(erViPåUdefinertFagsakSide(testUrl + sideUrl)).toBeFalsy());
            expect(erViPåUdefinertFagsakSide(testUrl + 'saksoversikt')).toBeFalsy();
            expect(erViPåUdefinertFagsakSide(testUrl + 'ny-behandling')).toBeFalsy();

            expect(erViPåUdefinertFagsakSide('dette-skal-ikke-være/en-definert-side')).toBeTruthy();
        });
    });

    describe('erViPåUlovligSteg', () => {
        test('Skal returnere true dersom vi er på ulovlig steg', () => {
            expect(erViPåUlovligSteg('vedtak', sider.REGISTRERE_SØKNAD)).toBeTruthy();
        });
        test('Skal returnere false dersom vi ikke er på ulovlig steg', () => {
            expect(erViPåUlovligSteg('registrer-soknad', sider.VILKÅRSVURDERING)).toBeFalsy();
        });
    });

    describe('finnSideForBehandlingssteg', () => {
        test('Skal returnere første side for behandlingssteget dersom det er før "send til beslutter"', () => {
            const behandling = lagBehandling({
                årsak: BehandlingÅrsak.SØKNAD,
                steg: BehandlingSteg.REGISTRERE_SØKNAD,
            });
            expect(finnSideForBehandlingssteg(behandling)).toEqual(sider.REGISTRERE_SØKNAD);

            const behandling2 = lagBehandling({
                årsak: BehandlingÅrsak.SØKNAD,
                steg: BehandlingSteg.SIMULERING,
            });
            expect(finnSideForBehandlingssteg(behandling2)).toEqual(sider.SIMULERING);
        });

        test(
            'Skal returnere Vedtak-siden dersom behandlingssteget er er etter "send til beslutter" ' +
                'og behandlinsårsaken ikke er "satsendring"',
            () => {
                const behandling = lagBehandling({
                    årsak: BehandlingÅrsak.SØKNAD,
                    steg: BehandlingSteg.AVSLUTT_BEHANDLING,
                });
                expect(finnSideForBehandlingssteg(behandling)).toEqual(sider.VEDTAK);
            }
        );

        test(
            'Skal returnere Simulering-siden dersom behandlingssteget er etter "send til beslutter" ' +
                'og behandlinsårsaken er "satsendring"',
            () => {
                const behandling = lagBehandling({
                    årsak: BehandlingÅrsak.SATSENDRING,
                    steg: BehandlingSteg.AVSLUTT_BEHANDLING,
                });
                expect(finnSideForBehandlingssteg(behandling)).toEqual(sider.SIMULERING);
            }
        );
    });
});
