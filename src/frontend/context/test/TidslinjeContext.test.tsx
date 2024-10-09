import React from 'react';

import { render } from '@testing-library/react';
import { endOfMonth, startOfMonth } from 'date-fns';

import type { Periode } from '@navikt/familie-tidslinje';

import { YtelseType, type IPersonMedAndelerTilkjentYtelse } from '../../typer/beregning';
import { TidslinjeProvider, useTidslinje } from '../TidslinjeContext';

describe('TidslinjeContext', () => {
    test('skal generere tidslinjerader for en person', () => {
        const tidslinjePersoner = genererTestdata([
            { type: 'Betaling', fom: '2024-02', tom: '2024-07' },
            { type: 'Ingen betaling', fom: '2024-08', tom: '2024-09' },
        ]);

        let rader: Periode[][] = [[]];
        const TestComponent = () => {
            const { genererRader } = useTidslinje();
            rader = genererRader(tidslinjePersoner);
            return null;
        };

        render(
            <TidslinjeProvider>
                <TestComponent />
            </TidslinjeProvider>
        );

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

        let rader: Periode[][] = [[]];
        const TestComponent = () => {
            const { genererRader } = useTidslinje();
            rader = genererRader(tidslinjePersoner);
            return null;
        };

        render(
            <TidslinjeProvider>
                <TestComponent />
            </TidslinjeProvider>
        );

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
