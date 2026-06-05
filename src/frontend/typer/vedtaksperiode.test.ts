import { describe, expect, test } from 'vitest';

import type { IVedtaksperiodeMedBegrunnelser } from './vedtaksperiode';
import { skalViseFritekstbegrunnelser, Vedtaksperiodetype } from './vedtaksperiode';

function lagVedtaksperiodeMedBegrunnelser(
    overstyringer: Partial<IVedtaksperiodeMedBegrunnelser> = {}
): IVedtaksperiodeMedBegrunnelser {
    return {
        id: 1,
        type: Vedtaksperiodetype.UTBETALING,
        begrunnelser: [],
        eøsBegrunnelser: [],
        fritekster: [],
        gyldigeBegrunnelser: [],
        utbetalingsperiodeDetaljer: [],
        støtterFritekst: false,
        ...overstyringer,
    };
}

describe('skalViseFritekstbegrunnelser', () => {
    test('skal ikke vise fritekst for UTBETALING når ingen begrunnelser støtter fritekst og det ikke finnes fritekster', () => {
        const vedtaksperiode = lagVedtaksperiodeMedBegrunnelser({
            type: Vedtaksperiodetype.UTBETALING,
            støtterFritekst: false,
            fritekster: [],
        });

        expect(skalViseFritekstbegrunnelser(vedtaksperiode)).toBe(false);
    });

    test('skal vise fritekst for UTBETALING når minst én begrunnelse støtter fritekst', () => {
        const vedtaksperiode = lagVedtaksperiodeMedBegrunnelser({
            type: Vedtaksperiodetype.UTBETALING,
            støtterFritekst: true,
        });

        expect(skalViseFritekstbegrunnelser(vedtaksperiode)).toBe(true);
    });

    test('skal vise fritekst for UTBETALING når det allerede finnes fritekster', () => {
        const vedtaksperiode = lagVedtaksperiodeMedBegrunnelser({
            type: Vedtaksperiodetype.UTBETALING,
            støtterFritekst: false,
            fritekster: ['En fritekst'],
        });

        expect(skalViseFritekstbegrunnelser(vedtaksperiode)).toBe(true);
    });

    test.each([Vedtaksperiodetype.OPPHØR, Vedtaksperiodetype.AVSLAG, Vedtaksperiodetype.FORTSATT_INNVILGET])(
        'skal vise fritekst for periodetype %s selv om ingen begrunnelser støtter fritekst',
        periodetype => {
            const vedtaksperiode = lagVedtaksperiodeMedBegrunnelser({
                type: periodetype,
                støtterFritekst: false,
                fritekster: [],
            });

            expect(skalViseFritekstbegrunnelser(vedtaksperiode)).toBe(true);
        }
    );
});
