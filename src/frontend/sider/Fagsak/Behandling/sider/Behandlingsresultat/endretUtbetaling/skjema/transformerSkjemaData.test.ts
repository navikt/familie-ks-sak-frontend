import { lagBehandling } from '@testutils/testdata/behandlingTestdata';
import { IEndretUtbetalingAndelÅrsak } from '@typer/utbetalingAndel';
import { describe, expect, test } from 'vitest';

import {
    EndretUtbetalingAndelFeltnavn,
    type EndretUtbetalingAndelFormValues,
    endretUtbetalingAndelSkjemaStandardverdier,
} from './endretUtbetalingAndelSkjemaTyper';
import { transformerSkjemaData } from './transformerSkjemaData';

const lagretAndel = { id: 1, erTilknyttetAndeler: true };

function lagFormValues(values: Partial<EndretUtbetalingAndelFormValues> = {}): EndretUtbetalingAndelFormValues {
    return {
        [EndretUtbetalingAndelFeltnavn.PERSON]: '12345678910',
        [EndretUtbetalingAndelFeltnavn.FOM]: '2024-01',
        [EndretUtbetalingAndelFeltnavn.TOM]: '2024-06',
        [EndretUtbetalingAndelFeltnavn.ÅRSAK]: IEndretUtbetalingAndelÅrsak.ALLEREDE_UTBETALT,
        [EndretUtbetalingAndelFeltnavn.PERIODE_SKAL_UTBETALES]: true,
        [EndretUtbetalingAndelFeltnavn.ER_EKSPLISITT_AVSLAG]: false,
        [EndretUtbetalingAndelFeltnavn.VEDTAKSBEGRUNNELSER]: [],
        [EndretUtbetalingAndelFeltnavn.SØKNADSTIDSPUNKT]: '2024-02-15',
        [EndretUtbetalingAndelFeltnavn.BEGRUNNELSE]: 'Begrunnelse',
        ...values,
    };
}

describe('transformerSkjemaData', () => {
    test('skal mappe skjemaverdier til payload', () => {
        expect(transformerSkjemaData(lagFormValues(), lagretAndel)).toEqual({
            id: 1,
            personIdent: '12345678910',
            prosent: 100,
            fom: '2024-01',
            tom: '2024-06',
            årsak: IEndretUtbetalingAndelÅrsak.ALLEREDE_UTBETALT,
            søknadstidspunkt: '2024-02-15',
            begrunnelse: 'Begrunnelse',
            erTilknyttetAndeler: true,
            erEksplisittAvslagPåSøknad: false,
            vedtaksbegrunnelser: [],
        });
    });

    test('skal sette prosent til 0 når perioden ikke skal utbetales', () => {
        const payload = transformerSkjemaData(
            lagFormValues({ [EndretUtbetalingAndelFeltnavn.PERIODE_SKAL_UTBETALES]: false }),
            lagretAndel
        );
        expect(payload.prosent).toBe(0);
    });

    test('skal ikke sende med personIdenter', () => {
        const payload = transformerSkjemaData(lagFormValues(), lagretAndel);
        expect(payload).not.toHaveProperty('personIdenter');
        expect(JSON.parse(JSON.stringify(payload))).not.toHaveProperty('personIdenter');
    });
});

describe('endretUtbetalingAndelSkjemaStandardverdier', () => {
    test('skal gi null for utbetaling når prosent ikke er satt', () => {
        const verdier = endretUtbetalingAndelSkjemaStandardverdier({ id: 1 }, lagBehandling());
        expect(verdier[EndretUtbetalingAndelFeltnavn.PERIODE_SKAL_UTBETALES]).toBeNull();
    });

    test.each([
        [100, true],
        [0, false],
    ])('skal gi riktig utbetaling for prosent %s', (prosent, forventet) => {
        const verdier = endretUtbetalingAndelSkjemaStandardverdier({ id: 1, prosent }, lagBehandling());
        expect(verdier[EndretUtbetalingAndelFeltnavn.PERIODE_SKAL_UTBETALES]).toBe(forventet);
    });

    test('skal bruke søknadstidspunkt fra andelen når det er satt', () => {
        const verdier = endretUtbetalingAndelSkjemaStandardverdier(
            { id: 1, søknadstidspunkt: '2024-02-15' },
            lagBehandling({ søknadMottattDato: '2024-01-10T12:30:00' })
        );
        expect(verdier[EndretUtbetalingAndelFeltnavn.SØKNADSTIDSPUNKT]).toBe('2024-02-15');
    });

    test('skal bruke søknad mottatt dato fra behandlingen som dato når andelen mangler søknadstidspunkt', () => {
        const verdier = endretUtbetalingAndelSkjemaStandardverdier(
            { id: 1 },
            lagBehandling({ søknadMottattDato: '2024-01-10T12:30:00' })
        );
        expect(verdier[EndretUtbetalingAndelFeltnavn.SØKNADSTIDSPUNKT]).toBe('2024-01-10');
    });

    test('skal gi null for søknadstidspunkt når verken andelen eller behandlingen har dato', () => {
        const verdier = endretUtbetalingAndelSkjemaStandardverdier({ id: 1 }, lagBehandling());
        expect(verdier[EndretUtbetalingAndelFeltnavn.SØKNADSTIDSPUNKT]).toBeNull();
    });
});
