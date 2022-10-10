import { act, renderHook } from '@testing-library/react-hooks';

import { useFelt, Valideringsstatus } from '@navikt/familie-skjema';
import type { FeltState } from '@navikt/familie-skjema';
import { kjønnType } from '@navikt/familie-typer';

import generator from '../../testverktøy/fnr/fnr-generator';
import type { IGrunnlagPerson } from '../../typer/person';
import { PersonType } from '../../typer/person';
import { Målform } from '../../typer/søknad';
import { Resultat } from '../../typer/vilkår';
import type { IPeriode } from '../kalender';
import { nyPeriode } from '../kalender';
import { erPeriodeGyldig, erResultatGyldig, identValidator } from '../validators';

describe('utils/validators', () => {
    const nyFeltState = <T>(verdi: T): FeltState<T> => ({
        feilmelding: '',
        valider: (feltState, _) => feltState,
        valideringsstatus: Valideringsstatus.IKKE_VALIDERT,
        verdi,
    });

    const grunnlagPersonFixture = (overstyrendeProps: Partial<IGrunnlagPerson> = {}) => {
        const defaults: IGrunnlagPerson = {
            personIdent: '12345678930',
            fødselsdato: '2000-05-17',
            type: PersonType.BARN,
            kjønn: kjønnType.KVINNE,
            navn: 'Mock Barn',
            målform: Målform.NB,
        };

        return { ...defaults, ...overstyrendeProps };
    };

    test('Periode med ugyldig fom gir feil', () => {
        const periode: FeltState<IPeriode> = nyFeltState(nyPeriode('400220', undefined));
        const valideringsresultat = erPeriodeGyldig(periode, {
            person: grunnlagPersonFixture(),
            erEksplisittAvslagPåSøknad: false,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.FEIL);
        expect(valideringsresultat.feilmelding).toEqual('Ugyldig f.o.m.');
    });

    test('Periode med ugyldig tom gir feil', () => {
        const periode: FeltState<IPeriode> = nyFeltState(nyPeriode('2020-06-17', '400220'));
        const valideringsresultat = erPeriodeGyldig(periode, {
            person: grunnlagPersonFixture(),
            erEksplisittAvslagPåSøknad: false,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.FEIL);
        expect(valideringsresultat.feilmelding).toEqual('Ugyldig t.o.m.');
    });

    test('Periode uten datoer gir feil hvis ikke avslag', () => {
        const periode: FeltState<IPeriode> = nyFeltState(nyPeriode(undefined, undefined));
        const valideringsresultat = erPeriodeGyldig(periode, {
            person: grunnlagPersonFixture(),
            erEksplisittAvslagPåSøknad: false,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.FEIL);
        expect(valideringsresultat.feilmelding).toEqual('F.o.m. må settes før du kan gå videre');
    });

    test('Periode uten fom-dato gir feil hvis avslag og tom-dato er satt', () => {
        const periode: FeltState<IPeriode> = nyFeltState(nyPeriode(undefined, '2010-05-17'));
        const valideringsresultat = erPeriodeGyldig(periode, {
            person: grunnlagPersonFixture(),
            erEksplisittAvslagPåSøknad: true,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.FEIL);
        expect(valideringsresultat.feilmelding).toEqual(
            'F.o.m. må settes eller t.o.m. må fjernes før du kan gå videre'
        );
    });

    test('Periode uten fom-dato, tom-dato og som er avslag gir ok', () => {
        const periode: FeltState<IPeriode> = nyFeltState(nyPeriode(undefined, undefined));
        const valideringsresultat = erPeriodeGyldig(periode, {
            person: grunnlagPersonFixture(),
            erEksplisittAvslagPåSøknad: true,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.OK);
    });

    test('Periode med fom-dato på oppfylt periode senere enn tom', () => {
        const periode: FeltState<IPeriode> = nyFeltState(nyPeriode('2010-06-17', '2010-01-17'));
        const valideringsresultat = erPeriodeGyldig(periode, {
            person: grunnlagPersonFixture(),
            erEksplisittAvslagPåSøknad: true,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.FEIL);
        expect(valideringsresultat.feilmelding).toEqual('F.o.m må settes tidligere enn t.o.m');
    });

    test('Periode med fom-dato før barnets fødselsdato på oppfylt periode gir feil', () => {
        const periode: FeltState<IPeriode> = nyFeltState(nyPeriode('1999-05-17', '2018-05-17'));
        const valideringsresultat = erPeriodeGyldig(periode, {
            person: grunnlagPersonFixture(),
            erEksplisittAvslagPåSøknad: false,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.FEIL);
        expect(valideringsresultat.feilmelding).toEqual(
            'Du kan ikke legge til periode før barnet har fylt 1 år'
        );
    });

    test('Periode med tom-dato etter barnets dødsfalldato gir feil', () => {
        const periode: FeltState<IPeriode> = nyFeltState(nyPeriode('2000-05-17', '2021-05-17'));
        const valideringsresultat = erPeriodeGyldig(periode, {
            person: grunnlagPersonFixture({ dødsfallDato: '2020-12-12' }),
            erEksplisittAvslagPåSøknad: true,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.FEIL);
        expect(valideringsresultat.feilmelding).toEqual(
            'Du kan ikke sette til og med dato etter dødsfalldato'
        );
    });

    test('Periode med fom-dato lik som tom-dato skal ikke være mulig dersom det ikke er barnets dødsfallsdato', () => {
        const periode: FeltState<IPeriode> = nyFeltState(nyPeriode('2020-12-12', '2020-12-12'));
        const valideringsresultat = erPeriodeGyldig(periode, {
            person: grunnlagPersonFixture(),
            erEksplisittAvslagPåSøknad: false,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.FEIL);
        expect(valideringsresultat.feilmelding).toEqual('F.o.m må settes tidligere enn t.o.m');
    });

    test('Periode med fom-dato lik som tom-dato skal være mulig dersom det er barnets dødsfallsdato', () => {
        const periode: FeltState<IPeriode> = nyFeltState(nyPeriode('2020-12-12', '2020-12-12'));
        const valideringsresultat = erPeriodeGyldig(periode, {
            person: grunnlagPersonFixture({ dødsfallDato: '2020-12-12' }),
            erEksplisittAvslagPåSøknad: false,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.OK);
    });

    test('Periode med etter barnets fødselsdato pluss 2 år gir feil på Mellom1Og2EllerAdoptert-vilkåret', () => {
        const periode: FeltState<IPeriode> = nyFeltState(nyPeriode('2001-05-17', '2018-05-17'));
        const valideringsresultat = erPeriodeGyldig(periode, {
            person: grunnlagPersonFixture(),
            erEksplisittAvslagPåSøknad: false,
            erMellom1Og2EllerAdoptertVilkår: true,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.FEIL);
        expect(valideringsresultat.feilmelding).toEqual(
            'Du kan ikke legge til periode på dette vilkåret fra barnet har fylt 2 år'
        );
    });

    test('Periode med etter barnets fødselsdato gir ok på andre vilkår', () => {
        const periode: FeltState<IPeriode> = nyFeltState(nyPeriode('2001-05-17', '2018-05-18'));
        const valideringsresultat = erPeriodeGyldig(periode, {
            person: grunnlagPersonFixture(),
            erEksplisittAvslagPåSøknad: false,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.OK);
    });

    test('Periode med innenfor 1-2 år gir ok på Mellom1Og2EllerAdoptert-vilkåret', () => {
        const periode: FeltState<IPeriode> = nyFeltState(nyPeriode('2001-05-17', '2002-05-16'));
        const valideringsresultat = erPeriodeGyldig(periode, {
            person: grunnlagPersonFixture(),
            erEksplisittAvslagPåSøknad: false,
            erMellom1Og2EllerAdoptertVilkår: true,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.OK);
    });

    test('Validering av ident', () => {
        const fnrGenerator = generator(new Date('10.02.2020'));
        const { result } = renderHook(() =>
            useFelt({
                verdi: '',
                valideringsfunksjon: identValidator,
            })
        );

        const validertTomIdent = result.current.valider(result.current);
        expect(validertTomIdent.valideringsstatus).toBe(Valideringsstatus.FEIL);
        expect(validertTomIdent.feilmelding).toBe('Identen har ikke 11 tall');

        act(() => result.current.onChange('12345678910'));
        const validertUgyldigIdent = result.current.valider(result.current);
        expect(validertUgyldigIdent.valideringsstatus).toBe(Valideringsstatus.FEIL);
        expect(validertUgyldigIdent.feilmelding).toBe('Identen er ugyldig');

        const fnr = fnrGenerator.next().value;
        if (fnr) {
            act(() => result.current.onChange(fnr));
        }

        expect(result.current.valider(result.current).valideringsstatus).toBe(Valideringsstatus.OK);
    });

    test('Validering av resultat på vilkår', () => {
        const { result } = renderHook(() =>
            useFelt({
                verdi: Resultat.IKKE_VURDERT,
                valideringsfunksjon: erResultatGyldig,
            })
        );

        const validertIkkeVurdert = result.current.valider(result.current);
        expect(validertIkkeVurdert.valideringsstatus).toBe(Valideringsstatus.FEIL);
        expect(validertIkkeVurdert.feilmelding).toBe('Resultat er ikke satt');

        act(() => result.current.onChange(Resultat.OPPFYLT));
        expect(result.current.valider(result.current).valideringsstatus).toBe(Valideringsstatus.OK);
    });
});
