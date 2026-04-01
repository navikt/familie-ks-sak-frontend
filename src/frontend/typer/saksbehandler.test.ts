import { describe, it, expect, vi, beforeEach } from 'vitest';

import { BehandlerRolle } from './behandling';
import { utledBehandlerRolle, harSuperbrukerTilgang, harSkrivetilgang } from './saksbehandler';
import { lagSaksbehandler } from '../testutils/testdata/saksbehandlerTestdata';
import { erProd } from '../utils/miljø';

vi.mock('../utils/miljø', () => ({
    erProd: vi.fn(),
}));

describe('Saksbehandler', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('Når miljø ikke er prod (Dev/Preprod)', () => {
        beforeEach(() => {
            vi.mocked(erProd).mockReturnValue(false);
        });

        const devGrupper = {
            veileder: '71f503a2-c28f-4394-a05a-8da263ceca4a',
            saksbehandler: 'c7e0b108-7ae6-432c-9ab4-946174c240c0',
            beslutter: '52fe1bef-224f-49df-a40a-29f92d4520f8',
            superbruker: '314fa714-f13c-4cdc-ac5c-e13ce08e241c',
            ukjent: 'en-tilfeldig-gruppe-id',
        };

        describe('utledBehandlerRolle', () => {
            it('skal returnere høyeste rolle (BESLUTTER) ved flere grupper', () => {
                const saksbehandler = lagSaksbehandler({ groups: [devGrupper.veileder, devGrupper.beslutter] });
                expect(utledBehandlerRolle(saksbehandler)).toBe(BehandlerRolle.BESLUTTER);
            });

            it('skal kaste feil hvis ingen gyldige grupper finnes', () => {
                const saksbehandler = lagSaksbehandler({ groups: [devGrupper.ukjent] });
                expect(() => utledBehandlerRolle(saksbehandler)).toThrow('Finner ikke rolle til saksbehandler.');
            });
        });

        describe('harSuperbrukerTilgang', () => {
            it('skal returnere true hvis bruker har superbruker-gruppe', () => {
                const saksbehandler = lagSaksbehandler({ groups: [devGrupper.superbruker] });
                expect(harSuperbrukerTilgang(saksbehandler)).toBe(true);
            });
        });

        describe('harSkrivetilgang', () => {
            it('skal returnere true for SAKSBEHANDLER', () => {
                const saksbehandler = lagSaksbehandler({ groups: [devGrupper.saksbehandler] });
                expect(harSkrivetilgang(saksbehandler)).toBe(true);
            });

            it('skal returnere false for kun VEILEDER', () => {
                const saksbehandler = lagSaksbehandler({ groups: [devGrupper.veileder] });
                expect(harSkrivetilgang(saksbehandler)).toBe(false);
            });
        });
    });

    describe('Når miljø ER prod', () => {
        beforeEach(() => {
            vi.mocked(erProd).mockReturnValue(true);
        });

        const prodGrupper = {
            veileder: '54cd86b8-2e23-48b2-8852-b05b5827bb0f',
            saksbehandler: 'e40090eb-c2fb-400e-b412-e9084019a73b',
            beslutter: '4e7f23d9-5db1-45c0-acec-89c86a9ec678',
            superbruker: 'b8158d87-a284-4620-9bf9-f0aa3f62c8aa',
        };

        describe('utledBehandlerRolle', () => {
            it('skal returnere riktig rolle basert på prod-grupper', () => {
                const saksbehandler = lagSaksbehandler({ groups: [prodGrupper.saksbehandler] });
                expect(utledBehandlerRolle(saksbehandler)).toBe(BehandlerRolle.SAKSBEHANDLER);
            });

            it('skal kaste feil hvis en bruker i prod kun har dev-grupper', () => {
                const devVeilederGruppe = '93a26831-9866-4410-927b-74ff51a9107c';
                const saksbehandler = lagSaksbehandler({ groups: [devVeilederGruppe] });
                expect(() => utledBehandlerRolle(saksbehandler)).toThrow('Finner ikke rolle til saksbehandler.');
            });
        });

        describe('harSuperbrukerTilgang', () => {
            it('skal returnere true for prod-superbruker', () => {
                const saksbehandler = lagSaksbehandler({ groups: [prodGrupper.superbruker] });
                expect(harSuperbrukerTilgang(saksbehandler)).toBe(true);
            });
        });
    });
});
