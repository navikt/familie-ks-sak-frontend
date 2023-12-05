import { kalenderDato, kalenderDiffMåned } from '../';

describe('Kalender aritmetikk ', () => {
    describe('Differanse i måned logikk', () => {
        describe('Tester differanse innenfor samme år', () => {
            test('Skal bli differansen i måneder', () => {
                const dagMånedÅr1 = kalenderDato('2020-02-15');
                const dagMånedÅr2 = kalenderDato('2020-03-11');
                const månedDiff = kalenderDiffMåned(dagMånedÅr1, dagMånedÅr2);
                expect(månedDiff).toBe(1);
            });

            test('Skal bli differansen i måneder', () => {
                const dagMånedÅr1 = kalenderDato('2020-02-15');
                const dagMånedÅr2 = kalenderDato('2020-04-11');
                const månedDiff = kalenderDiffMåned(dagMånedÅr1, dagMånedÅr2);
                expect(månedDiff).toBe(2);
            });
        });

        describe('Tester differanse på tvers av år', () => {
            test('Skal bli differansen i år * 12', () => {
                const dagMånedÅr1 = kalenderDato('2020-01-15');
                const dagMånedÅr2 = kalenderDato('2021-01-11');
                const månedDiff = kalenderDiffMåned(dagMånedÅr1, dagMånedÅr2);
                expect(månedDiff).toBe(12);
            });

            test('Skal bli differansen år * 12 pluss differansen i måneder', () => {
                const dagMånedÅr1 = kalenderDato('2020-12-15');
                const dagMånedÅr2 = kalenderDato('2021-01-11');
                const månedDiff = kalenderDiffMåned(dagMånedÅr1, dagMånedÅr2);
                expect(månedDiff).toBe(1);
            });
        });
    });
});
