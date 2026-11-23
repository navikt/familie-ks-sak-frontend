import { kjønnType } from '@navikt/familie-typer';
import { lagFagsak } from '@testutils/testdata/fagsakTestdata';
import { YtelseType } from '@typer/beregning';
import { FagsakId } from '@typer/fagsak';
import { PersonType } from '@typer/person';
import { Målform } from '@typer/søknad';
import { Vedtaksperiodetype } from '@typer/vedtaksperiode';
import { dateTilIsoDatoString, hentDagensDato } from '@utils/dato';
import { hentBarnMedLøpendeUtbetaling } from '@utils/fagsak';
import { addYears } from 'date-fns';

describe('hentBarnMedLøpendeUtbetaling', () => {
    test('Hent barn med løpende utbetalinger på fagsak', () => {
        const barnFnr = '12345678910';
        const person = {
            fødselsdato: '2020-01-02',
            kjønn: kjønnType.KVINNE,
            målform: Målform.NB,
            navn: 'Mock Mockersen',
            personIdent: barnFnr,
            type: PersonType.BARN,
        };

        const fagsak = lagFagsak({
            gjeldendeUtbetalingsperioder: [
                {
                    periodeFom: '2020-01-01',
                    periodeTom: '2020-12-31',
                    vedtaksperiodetype: Vedtaksperiodetype.UTBETALING,
                    utbetalingsperiodeDetaljer: [
                        {
                            person: {
                                ...person,
                                personIdent: '12345678911',
                            },
                            utbetaltPerMnd: 1054,
                            erPåvirketAvEndring: false,
                            prosent: 80,
                            ytelseType: YtelseType.ORDINÆR_KONTANTSTØTTE,
                        },
                    ],
                    antallBarn: 1,
                    utbetaltPerMnd: 1054,
                },
                {
                    periodeFom: '2021-01-01',
                    periodeTom: dateTilIsoDatoString(addYears(hentDagensDato(), 1)),
                    vedtaksperiodetype: Vedtaksperiodetype.UTBETALING,
                    utbetalingsperiodeDetaljer: [
                        {
                            person,
                            utbetaltPerMnd: 1054,
                            erPåvirketAvEndring: false,
                            prosent: 80,
                            ytelseType: YtelseType.ORDINÆR_KONTANTSTØTTE,
                        },
                    ],
                    antallBarn: 1,
                    utbetaltPerMnd: 1054,
                },
            ],
        });

        const barnMedLøpendeUtbetaling = hentBarnMedLøpendeUtbetaling(fagsak);

        expect(barnMedLøpendeUtbetaling.size).toBe(1);
        expect(barnMedLøpendeUtbetaling.has(barnFnr)).toBe(true);
    });
});

describe('FagsakId.erGyldig', () => {
    test.each([1, 123, Number.MAX_SAFE_INTEGER])('skal returnere true for %s', id => {
        expect(FagsakId.erGyldig(id)).toBe(true);
    });

    test.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
        'skal returnere false for %s',
        id => {
            expect(FagsakId.erGyldig(id)).toBe(false);
        }
    );
});

describe('FagsakId.fra', () => {
    test('skal returnere fagsakId for et positivt heltall', () => {
        expect(FagsakId.fra(123)).toBe(123);
    });

    test.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
        'skal kaste feil for %s',
        id => {
            expect(() => FagsakId.fra(id)).toThrow(`Ugyldig fagsakId: ${id}`);
        }
    );
});
