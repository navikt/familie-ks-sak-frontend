import { renderHook } from '@testing-library/react';
import { endOfMonth, startOfMonth } from 'date-fns';

import { TidslinjeProvider, useTidslinjeContext } from '../../komponenter/Tidslinje/TidslinjeContext';
import { type IPersonMedAndelerTilkjentYtelse, YtelseType } from '../../typer/beregning';

describe('TidslinjeContext', () => {
    test('skal generere tidslinjerader for en person', () => {
        const tidslinjePersoner = genererTestdata([
            { type: 'Betaling', fom: '2024-02', tom: '2024-07' },
            { type: 'Ingen betaling', fom: '2024-08', tom: '2024-09' },
        ]);

        const { result } = renderHook(() => useTidslinjeContext(), { wrapper: TidslinjeProvider });
        const rader = result.current.genererRader(tidslinjePersoner);

        const forventetResultat = [
            [
                {
                    fom: startOfMonth(new Date('2024-02-01')),
                    tom: endOfMonth(new Date('2024-07-31')),
                    id: '18412374602_1_4',
                    status: 'suksess',
                },
                {
                    fom: startOfMonth(new Date('2024-08-01')),
                    tom: endOfMonth(new Date('2024-09-30')),
                    id: '18412374602_7_4',
                    status: 'feil',
                },
            ],
        ];

        expect(rader).toEqual(forventetResultat);
    });

    test('skal generere tidslinjerader for en person som også har overgangsordning', () => {
        const tidslinjePersoner = genererTestdata([
            { type: 'Betaling', fom: '2024-02', tom: '2024-07' },
            { type: 'Overgangsordning', fom: '2024-08', tom: '2024-09' },
        ]);

        const { result } = renderHook(() => useTidslinjeContext(), { wrapper: TidslinjeProvider });
        const rader = result.current.genererRader(tidslinjePersoner);

        const forventetResultat = [
            [
                {
                    fom: startOfMonth(new Date('2024-02-01')),
                    tom: endOfMonth(new Date('2024-07-31')),
                    id: '18412374602_1_4',
                    status: 'suksess',
                },
                {
                    fom: startOfMonth(new Date('2024-08-01')),
                    tom: endOfMonth(new Date('2024-09-30')),
                    id: '18412374602_7_4',
                    status: 'advarsel',
                },
            ],
        ];

        expect(rader).toEqual(forventetResultat);
    });

    type Testperiode = {
        type: 'Betaling' | 'Ingen betaling' | 'Overgangsordning';
        fom: string;
        tom: string;
    };

    function genererTestdata(testperioder: Testperiode[]): IPersonMedAndelerTilkjentYtelse[] {
        return [
            {
                personIdent: '18412374602',
                beløp: 7500,
                stønadFom: testperioder[0].fom,
                stønadTom: testperioder[testperioder.length - 1].tom,
                ytelsePerioder: testperioder.map(periode => ({
                    beløp: 7500,
                    stønadFom: periode.fom,
                    stønadTom: periode.tom,
                    ytelseType:
                        periode.type === 'Overgangsordning'
                            ? YtelseType.OVERGANGSORDNING
                            : YtelseType.ORDINÆR_KONTANTSTØTTE,
                    skalUtbetales: periode.type === 'Ingen betaling' ? false : true,
                })),
            },
        ];
    }
});
