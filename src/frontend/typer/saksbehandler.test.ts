import { describe, it, expect, vi, beforeEach } from 'vitest';

import { BehandlerRolle } from './behandling';
import {
    utledBehandlerRolle,
    harSuperbrukertilgang,
    harSkrivetilgang,
    mapISaksbehandlerTilSaksbehandler,
} from './saksbehandler';
import { lagISaksbehandler } from '../testutils/testdata/saksbehandlerTestdata';
import { erProd } from '../utils/miljø';

vi.mock('../utils/miljø', () => ({
    erProd: vi.fn(),
}));

describe('Saksbehandler', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    const devGrupper = {
        veileder: '71f503a2-c28f-4394-a05a-8da263ceca4a',
        saksbehandler: 'c7e0b108-7ae6-432c-9ab4-946174c240c0',
        beslutter: '52fe1bef-224f-49df-a40a-29f92d4520f8',
        superbruker: '314fa714-f13c-4cdc-ac5c-e13ce08e241c',
        ukjent: 'en-tilfeldig-gruppe-id',
    };

    const prodGrupper = {
        veileder: '54cd86b8-2e23-48b2-8852-b05b5827bb0f',
        saksbehandler: 'e40090eb-c2fb-400e-b412-e9084019a73b',
        beslutter: '4e7f23d9-5db1-45c0-acec-89c86a9ec678',
        superbruker: 'b8158d87-a284-4620-9bf9-f0aa3f62c8aa',
    };

    describe('utledBehandlerRolle - ikke prod', () => {
        beforeEach(() => {
            vi.mocked(erProd).mockReturnValue(false);
        });

        it('skal returnere høyeste rolle (BESLUTTER) ved flere grupper', () => {
            const iSaksbehandler = lagISaksbehandler({ groups: [devGrupper.veileder, devGrupper.beslutter] });
            expect(utledBehandlerRolle(iSaksbehandler)).toBe(BehandlerRolle.BESLUTTER);
        });

        it('skal kaste feil hvis ingen gyldige grupper finnes', () => {
            const iSaksbehandler = lagISaksbehandler({ groups: [devGrupper.ukjent] });
            expect(() => utledBehandlerRolle(iSaksbehandler)).toThrow('Finner ikke rolle til saksbehandler.');
        });
    });

    describe('utledBehandlerRolle - prod', () => {
        beforeEach(() => {
            vi.mocked(erProd).mockReturnValue(true);
        });

        it('skal returnere riktig rolle basert på prod-grupper', () => {
            const iSaksbehandler = lagISaksbehandler({ groups: [prodGrupper.saksbehandler] });
            expect(utledBehandlerRolle(iSaksbehandler)).toBe(BehandlerRolle.SAKSBEHANDLER);
        });

        it('skal kaste feil hvis en bruker i prod kun har dev-grupper', () => {
            const devVeilederGruppe = '93a26831-9866-4410-927b-74ff51a9107c';
            const iSaksbehandler = lagISaksbehandler({ groups: [devVeilederGruppe] });
            expect(() => utledBehandlerRolle(iSaksbehandler)).toThrow('Finner ikke rolle til saksbehandler.');
        });
    });

    describe('harSuperbrukertilgang - ikke prod', () => {
        beforeEach(() => {
            vi.mocked(erProd).mockReturnValue(false);
        });

        it('skal returnere true hvis bruker har superbruker-gruppe', () => {
            const iSaksbehandler = lagISaksbehandler({ groups: [devGrupper.superbruker] });
            expect(harSuperbrukertilgang(iSaksbehandler)).toBe(true);
        });
    });

    describe('harSuperbrukertilgang - prod', () => {
        beforeEach(() => {
            vi.mocked(erProd).mockReturnValue(true);
        });

        it('skal returnere true for prod-superbruker', () => {
            const iSaksbehandler = lagISaksbehandler({ groups: [prodGrupper.superbruker] });
            expect(harSuperbrukertilgang(iSaksbehandler)).toBe(true);
        });
    });

    describe('harSkrivetilgang - ikke prod', () => {
        beforeEach(() => {
            vi.mocked(erProd).mockReturnValue(false);
        });

        it('skal returnere true for SAKSBEHANDLER', () => {
            const iSaksbehandler = lagISaksbehandler({ groups: [devGrupper.saksbehandler] });
            expect(harSkrivetilgang(iSaksbehandler)).toBe(true);
        });

        it('skal returnere false for kun VEILEDER', () => {
            const iSaksbehandler = lagISaksbehandler({ groups: [devGrupper.veileder] });
            expect(harSkrivetilgang(iSaksbehandler)).toBe(false);
        });
    });

    describe('harSkrivetilgang - prod', () => {
        beforeEach(() => {
            vi.mocked(erProd).mockReturnValue(true);
        });

        it('skal returnere true for SAKSBEHANDLER', () => {
            const iSaksbehandler = lagISaksbehandler({ groups: [prodGrupper.saksbehandler] });
            expect(harSkrivetilgang(iSaksbehandler)).toBe(true);
        });

        it('skal returnere false for kun VEILEDER', () => {
            const iSaksbehandler = lagISaksbehandler({ groups: [prodGrupper.veileder] });
            expect(harSkrivetilgang(iSaksbehandler)).toBe(false);
        });
    });

    describe('mapISaksbehandlerTilSaksbehandler', () => {
        it('skal kaste feil hvis groups er undefined for ISaksbehandler', () => {
            // Arrange
            const iSaksbehandler = lagISaksbehandler({ groups: undefined });

            // Act & assert
            expect(() => mapISaksbehandlerTilSaksbehandler(iSaksbehandler)).toThrow(
                'Finner ikke rolle til saksbehandler.'
            );
        });

        it('skal bevare gruppene fra ISaksbehandler', () => {
            const iSaksbehandler = lagISaksbehandler({ groups: ['71f503a2-c28f-4394-a05a-8da263ceca4a'] });

            // Act
            const result = mapISaksbehandlerTilSaksbehandler(iSaksbehandler);

            // Assert
            expect(result).toEqual({
                ...iSaksbehandler,
                groups: ['71f503a2-c28f-4394-a05a-8da263ceca4a'],
                rolle: BehandlerRolle.VEILEDER,
                harSkrivetilgang: false,
                harSuperbrukertilgang: false,
            });
        });
    });
});
