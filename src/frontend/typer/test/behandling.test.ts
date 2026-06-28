import {
    BehandlingResultat,
    BehandlingÅrsak,
    behandlingÅrsakerSomIkkeSkalSettesManuelt,
    erBehandlingHenlagt,
} from '../behandling';

describe('Behandlingstester', () => {
    test('Alle henleggelsesresultater skal trigge erHenlagt', () => {
        Object.values(BehandlingResultat).forEach(resultat => {
            if (resultat.includes('HENLAGT')) {
                expect(erBehandlingHenlagt(resultat)).toBe(true);
            } else {
                expect(erBehandlingHenlagt(resultat)).toBe(false);
            }
        });
    });
});

describe('behandlingÅrsakerSomIkkeSkalSettesManuelt inneholde alle behandlingsårsaker som ikke skal kunne velges manuelt', () => {
    test('Inneholder forventede behandlingsårsaker', () => {
        // Arrange
        const forventedeBehandlingsårsaker = new Set([
            BehandlingÅrsak.KLAGE,
            BehandlingÅrsak.LOVENDRING_2024,
            BehandlingÅrsak.SATSENDRING,
        ]);

        // Act
        const behandlingsårsaker = behandlingÅrsakerSomIkkeSkalSettesManuelt();

        // Assert
        const behandlingsårsakerSet = new Set(behandlingsårsaker);
        const forventedeBehandlingsårsakerSet = new Set(forventedeBehandlingsårsaker);
        expect(behandlingsårsakerSet.size == forventedeBehandlingsårsakerSet.size);
        expect(
            [...behandlingsårsakerSet].every(behandlingÅrsak =>
                [...forventedeBehandlingsårsakerSet].includes(behandlingÅrsak)
            )
        );
    });
});
