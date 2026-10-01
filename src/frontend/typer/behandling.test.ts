import { describe, expect } from 'vitest';
import { lagBehandling } from '../testutils/testdata/behandlingTestdata';
import { MIDLERTIDIG_BEHANDLENDE_ENHET_ID, sjekkErBehandleneEnhetMidlertidig } from './behandling';

describe('behandling', () => {
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
});
