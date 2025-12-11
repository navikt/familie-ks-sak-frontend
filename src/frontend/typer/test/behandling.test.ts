import {
    BehandlingResultat,
    BehandlingÅrsak,
    behandlingÅrsakerSomIkkeSkalSettesManuelt,
    erBehandlingHenlagt,
} from '../behandling';
import { type FeatureToggles } from '../featureToggles';

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
    test('Alle relevante toggles er skrudd på', () => {
        // Arrange
        const toggles: FeatureToggles = {
            kanOppretteRevurderingMedAarsakIverksetteKaVedtak: true,
            kanManueltKorrigereMedVedtaksbrev: true,
        };

        const forventedeBehandlingsårsaker = new Set([
            BehandlingÅrsak.KLAGE,
            BehandlingÅrsak.LOVENDRING_2024,
            BehandlingÅrsak.SATSENDRING,
        ]);

        // Act
        const behandlingsårsaker = behandlingÅrsakerSomIkkeSkalSettesManuelt(toggles);

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
    test('Alle relevante toggles er skrudd av', () => {
        // Arrange
        const toggles: FeatureToggles = {
            kanOppretteRevurderingMedAarsakIverksetteKaVedtak: false,
            kanManueltKorrigereMedVedtaksbrev: false,
        };

        const forventedeBehandlingsårsaker = new Set([
            BehandlingÅrsak.KLAGE,
            BehandlingÅrsak.LOVENDRING_2024,
            BehandlingÅrsak.SATSENDRING,
            BehandlingÅrsak.IVERKSETTE_KA_VEDTAK,
            BehandlingÅrsak.KORREKSJON_VEDTAKSBREV,
        ]);

        // Act
        const behandlingsårsaker = behandlingÅrsakerSomIkkeSkalSettesManuelt(toggles);

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
    test('Toggelen kanOppretteRevurderingMedAarsakIverksetteKaVedtak er skrudd på', () => {
        // Arrange
        const toggles: FeatureToggles = {
            kanOppretteRevurderingMedAarsakIverksetteKaVedtak: true,
            kanManueltKorrigereMedVedtaksbrev: false,
        };

        const forventedeBehandlingsårsaker = new Set([
            BehandlingÅrsak.KLAGE,
            BehandlingÅrsak.LOVENDRING_2024,
            BehandlingÅrsak.SATSENDRING,
            BehandlingÅrsak.KORREKSJON_VEDTAKSBREV,
        ]);
        // Act
        const behandlingsårsaker = behandlingÅrsakerSomIkkeSkalSettesManuelt(toggles);

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
    test('Toggelen kanManueltKorrigereMedVedtaksbrev er skrudd på', () => {
        // Arrange
        const toggles: FeatureToggles = {
            kanOppretteRevurderingMedAarsakIverksetteKaVedtak: false,
            kanManueltKorrigereMedVedtaksbrev: true,
        };

        const forventedeBehandlingsårsaker = new Set([
            BehandlingÅrsak.KLAGE,
            BehandlingÅrsak.LOVENDRING_2024,
            BehandlingÅrsak.SATSENDRING,
            BehandlingÅrsak.IVERKSETTE_KA_VEDTAK,
        ]);
        // Act
        const behandlingsårsaker = behandlingÅrsakerSomIkkeSkalSettesManuelt(toggles);

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
