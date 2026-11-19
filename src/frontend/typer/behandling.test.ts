import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { describe, expect } from 'vitest';
import {
    BehandlingResultat,
    BehandlingSteg,
    BehandlingÅrsak,
    behandlingÅrsakerSomIkkeSkalSettesManuelt,
    erBehandlingHenlagt,
    hentStegnummer,
    MIDLERTIDIG_BEHANDLENDE_ENHET_ID,
    sjekkErBehandleneEnhetMidlertidig,
} from './behandling';

describe('sjekkErBehandleneEnhetMidlertidig', () => {
    test('skal returnere true hvis behandling er på midlertidig enhet', () => {
        const behandling = lagBehandling({
            arbeidsfordelingPåBehandling: {
                behandlendeEnhetId: MIDLERTIDIG_BEHANDLENDE_ENHET_ID,
                behandlendeEnhetNavn: 'midlertidig enhet',
                manueltOverstyrt: false,
            },
        });

        const erBehandleneEnhetMidlertidig = sjekkErBehandleneEnhetMidlertidig(behandling);

        expect(erBehandleneEnhetMidlertidig).toBeTruthy();
    });

    test('skal returnere false hvis behandling er på midlertidig enhet', () => {
        const behandling = lagBehandling({
            arbeidsfordelingPåBehandling: {
                behandlendeEnhetId: '0001',
                behandlendeEnhetNavn: 'Oslo',
                manueltOverstyrt: false,
            },
        });

        const erBehandleneEnhetMidlertidig = sjekkErBehandleneEnhetMidlertidig(behandling);

        expect(erBehandleneEnhetMidlertidig).toBeFalsy();
    });
});

describe('erBehandlingHenlagt', () => {
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

describe('hentStegnummer', () => {
    test.each([
        [BehandlingSteg.REGISTRERE_PERSONGRUNNLAG, 1],
        [BehandlingSteg.REGISTRERE_SØKNAD, 2],
        [BehandlingSteg.VILKÅRSVURDERING, 3],
        [BehandlingSteg.BEHANDLINGSRESULTAT, 4],
        [BehandlingSteg.SIMULERING, 5],
        [BehandlingSteg.VEDTAK, 6],
        [BehandlingSteg.BESLUTTE_VEDTAK, 7],
        [BehandlingSteg.IVERKSETT_MOT_OPPDRAG, 8],
        [BehandlingSteg.JOURNALFØR_VEDTAKSBREV, 9],
        [BehandlingSteg.AVSLUTT_BEHANDLING, 10],
    ])('skal returnere riktig stegnummer for %s', (steg, forventetStegnummer) => {
        expect(hentStegnummer(steg)).toBe(forventetStegnummer);
    });

    test('skal returnere 0 for ukjent steg', () => {
        expect(hentStegnummer('UKJENT_STEG' as BehandlingSteg)).toBe(0);
    });
});

describe('behandlingÅrsakerSomIkkeSkalSettesManuelt', () => {
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
        expect(behandlingsårsakerSet.size === forventedeBehandlingsårsakerSet.size).toBe(true);
        expect(
            [...behandlingsårsakerSet].every(behandlingÅrsak =>
                [...forventedeBehandlingsårsakerSet].includes(behandlingÅrsak)
            )
        ).toBe(true);
    });
});
