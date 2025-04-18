import {
    SideId,
    hentTrinnForBehandling,
    sider,
    erViPåUdefinertFagsakSide,
    erViPåUlovligSteg,
    finnSideForBehandlingssteg,
} from './sider';
import { BehandlingÅrsak, BehandlingSteg } from '../../../../typer/behandling';
import { mockBehandling } from '../../../../utils/test/behandling/behandling.mock';

describe('sider.ts', () => {
    describe('siderForBehandling', () => {
        test('REGISTRERE_SØKNAD returneres ved årsak SØKNAD', () => {
            const behandling = mockBehandling({ årsak: BehandlingÅrsak.SØKNAD });
            expect(Object.keys(hentTrinnForBehandling(behandling))).toContain(
                SideId.REGISTRERE_SØKNAD
            );
        });
        test('VEDTAK returneres ikke ved årsak SATSENDRING', () => {
            const behandling = mockBehandling({ årsak: BehandlingÅrsak.SATSENDRING });
            expect(Object.keys(hentTrinnForBehandling(behandling))).not.toContain(SideId.VEDTAK);
        });
        test('Standard revurdering uten søknad viser alle sider bortsett fra REGISTRERE_SØKNAD', () => {
            const behandling = mockBehandling({ årsak: BehandlingÅrsak.NYE_OPPLYSNINGER });
            expect(Object.keys(hentTrinnForBehandling(behandling))).toEqual(
                Object.values(SideId).filter(side => side !== SideId.REGISTRERE_SØKNAD)
            );
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
                .forEach(sideUrl =>
                    expect(erViPåUdefinertFagsakSide(testUrl + sideUrl)).toBeFalsy()
                );
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
            const behandling = mockBehandling({
                årsak: BehandlingÅrsak.SØKNAD,
                steg: BehandlingSteg.REGISTRERE_SØKNAD,
            });
            expect(finnSideForBehandlingssteg(behandling)).toEqual(sider.REGISTRERE_SØKNAD);

            const behandling2 = mockBehandling({
                årsak: BehandlingÅrsak.SØKNAD,
                steg: BehandlingSteg.SIMULERING,
            });
            expect(finnSideForBehandlingssteg(behandling2)).toEqual(sider.SIMULERING);
        });

        test(
            'Skal returnere Vedtak-siden dersom behandlingssteget er er etter "send til beslutter" ' +
                'og behandlinsårsaken ikke er "satsendring"',
            () => {
                const behandling = mockBehandling({
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
                const behandling = mockBehandling({
                    årsak: BehandlingÅrsak.SATSENDRING,
                    steg: BehandlingSteg.AVSLUTT_BEHANDLING,
                });
                expect(finnSideForBehandlingssteg(behandling)).toEqual(sider.SIMULERING);
            }
        );
    });
});
