import { behandlingsresultater } from './behandling';
import { KlageinstansEventType, klageinstansUtfallTilTekst, KlageService } from './klage';
import { Testdata } from '../testdata/Testdata';

describe('KlageService', () => {
    describe('HarAnkeEksistertPåKlagebehandling', () => {
        const ankeTyper = Testdata.lagAnkeKlageinstansEventTyper();
        const ikkeAnkeTyper = Testdata.lagIkkeAnkeKlageinstansEventTyper();

        test.each(ankeTyper)('skal returnere true om type er anke', type => {
            // Arrange
            const klagebehandling = Testdata.lagKlagebehandling({
                klageinstansResultat: [Testdata.lagKlageinstansResultat({ type })],
            });

            // Act
            const eksistert = KlageService.harAnkeEksistertPåKlagebehandling(klagebehandling);

            // Expect
            expect(eksistert).toBe(true);
        });

        test.each(ikkeAnkeTyper)('skal returnere false om type ikke er anke', type => {
            // Arrange
            const klagebehandling = Testdata.lagKlagebehandling({
                klageinstansResultat: [Testdata.lagKlageinstansResultat({ type })],
            });

            // Act
            const eksistert = KlageService.harAnkeEksistertPåKlagebehandling(klagebehandling);

            // Expect
            expect(eksistert).toBe(false);
        });
    });

    describe('ErKlageFeilregistrertAvKA', () => {
        const feilregistrertTyper = Testdata.lagFeilregistrertKlageinstansEventTyper();
        const ikkeFeilregistrertTyper = Testdata.lagIkkeFeilregistrertKlageinstansEventTyper();

        test.each(feilregistrertTyper)('skal returnere true om', type => {
            // Arrange
            const klagebehandling = Testdata.lagKlagebehandling({
                klageinstansResultat: [Testdata.lagKlageinstansResultat({ type })],
            });

            // Act
            const erFeilregistrert = KlageService.erKlageFeilregistrertAvKA(klagebehandling);

            // Expect
            expect(erFeilregistrert).toBe(true);
        });

        test.each(ikkeFeilregistrertTyper)('skal returnere true om', type => {
            // Arrange
            const klagebehandling = Testdata.lagKlagebehandling({
                klageinstansResultat: [Testdata.lagKlageinstansResultat({ type })],
            });

            // Act
            const erFeilregistrert = KlageService.erKlageFeilregistrertAvKA(klagebehandling);

            // Expect
            expect(erFeilregistrert).toBe(false);
        });
    });

    describe('UtledKlagebehandlingResultattekst', () => {
        const alleKlageinstansUtfall = Testdata.lagAlleKlageinstansUtfall();
        const alleKlageResultat = Testdata.lagAlleKlageResultat();

        test.each(alleKlageinstansUtfall)('skal utlede forventet tekst fra utfall', utfall => {
            // Arrange
            const klagebehandling = Testdata.lagKlagebehandling({
                klageinstansResultat: [Testdata.lagKlageinstansResultat({ utfall })],
            });

            // Act
            const tekst = KlageService.utledKlagebehandlingResultattekst(klagebehandling);

            // Expect
            expect(tekst).toBe(klageinstansUtfallTilTekst[utfall]);
        });

        test('skal utlede feilregistrert klagebehandlingtekst', () => {
            // Arrange
            const klagebehandling = Testdata.lagKlagebehandling({
                klageinstansResultat: [
                    Testdata.lagKlageinstansResultat({
                        type: KlageinstansEventType.BEHANDLING_FEILREGISTRERT,
                        utfall: undefined,
                    }),
                ],
            });

            // Act
            const tekst = KlageService.utledKlagebehandlingResultattekst(klagebehandling);

            // Expect
            expect(tekst).toBe('Feilregistrert (KA)');
        });

        test.each(alleKlageResultat)('skal utlede tekst for resultat på behandlingen', resultat => {
            // Arrange
            const klagebehandling = Testdata.lagKlagebehandling({ resultat: resultat });

            // Act
            const tekst = KlageService.utledKlagebehandlingResultattekst(klagebehandling);

            // Expect
            expect(tekst).toBe(behandlingsresultater[resultat]);
        });

        test('skal utlede tilbakefallende tekst hvis ingenting annet kan utledes', () => {
            // Arrange
            const klagebehandling = Testdata.lagKlagebehandling({ resultat: undefined });

            // Act
            const tekst = KlageService.utledKlagebehandlingResultattekst(klagebehandling);

            // Expect
            expect(tekst).toBe('Ikke satt');
        });
    });
});
