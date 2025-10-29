import { act, renderHook } from '@testing-library/react';
import { addDays, addMonths, formatISO } from 'date-fns';

import type { FeltState } from '@navikt/familie-skjema';
import { useFelt, Valideringsstatus } from '@navikt/familie-skjema';
import { kjønnType } from '@navikt/familie-typer';

import generator from '../../testutils/testverktøy/fnr/fnr-generator';
import type { IGrunnlagPerson } from '../../typer/person';
import { PersonType } from '../../typer/person';
import { Målform } from '../../typer/søknad';
import { Resultat, UtdypendeVilkårsvurderingGenerell, VilkårType } from '../../typer/vilkår';
import { type IIsoDatoPeriode, nyIsoDatoPeriode } from '../dato';
import { erPeriodeGyldig, erResultatGyldig, identValidator } from '../validators';

describe('utils/validators', () => {
    const nyFeltState = <T>(verdi: T): FeltState<T> => ({
        feilmelding: '',
        valider: (feltState, _) => feltState,
        valideringsstatus: Valideringsstatus.IKKE_VALIDERT,
        verdi,
    });

    const lagGrunnlagPerson = (overstyrendeProps: Partial<IGrunnlagPerson> = {}) => {
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
        const periode: FeltState<IIsoDatoPeriode> = nyFeltState(nyIsoDatoPeriode('400220', undefined));
        const valideringsresultat = erPeriodeGyldig(periode, VilkårType.LOVLIG_OPPHOLD, {
            person: lagGrunnlagPerson(),
            erEksplisittAvslagPåSøknad: false,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.FEIL);
        expect(valideringsresultat.feilmelding).toEqual('Ugyldig f.o.m.');
    });

    test('Periode med ugyldig tom gir feil', () => {
        const periode: FeltState<IIsoDatoPeriode> = nyFeltState(nyIsoDatoPeriode('2020-06-17', '400220'));
        const valideringsresultat = erPeriodeGyldig(periode, VilkårType.LOVLIG_OPPHOLD, {
            person: lagGrunnlagPerson(),
            erEksplisittAvslagPåSøknad: false,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.FEIL);
        expect(valideringsresultat.feilmelding).toEqual('Ugyldig t.o.m.');
    });

    test('Periode uten datoer gir feil hvis ikke avslag', () => {
        const periode: FeltState<IIsoDatoPeriode> = nyFeltState(nyIsoDatoPeriode(undefined, undefined));
        const valideringsresultat = erPeriodeGyldig(periode, VilkårType.LOVLIG_OPPHOLD, {
            person: lagGrunnlagPerson(),
            erEksplisittAvslagPåSøknad: false,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.FEIL);
        expect(valideringsresultat.feilmelding).toEqual('F.o.m. må settes før du kan gå videre');
    });

    test('Periode uten fom-dato gir feil hvis avslag og tom-dato er satt', () => {
        const periode: FeltState<IIsoDatoPeriode> = nyFeltState(nyIsoDatoPeriode(undefined, '2010-05-17'));
        const valideringsresultat = erPeriodeGyldig(periode, VilkårType.LOVLIG_OPPHOLD, {
            person: lagGrunnlagPerson(),
            erEksplisittAvslagPåSøknad: true,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.FEIL);
        expect(valideringsresultat.feilmelding).toEqual(
            'F.o.m. må settes eller t.o.m. må fjernes før du kan gå videre'
        );
    });

    test('Periode uten fom-dato, tom-dato og som er avslag gir ok', () => {
        const periode: FeltState<IIsoDatoPeriode> = nyFeltState(nyIsoDatoPeriode(undefined, undefined));
        const valideringsresultat = erPeriodeGyldig(periode, VilkårType.LOVLIG_OPPHOLD, {
            person: lagGrunnlagPerson(),
            erEksplisittAvslagPåSøknad: true,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.OK);
    });

    test('Periode med fom-dato på oppfylt periode senere enn tom', () => {
        const periode: FeltState<IIsoDatoPeriode> = nyFeltState(nyIsoDatoPeriode('2010-06-17', '2010-01-17'));
        const valideringsresultat = erPeriodeGyldig(periode, VilkårType.LOVLIG_OPPHOLD, {
            person: lagGrunnlagPerson(),
            erEksplisittAvslagPåSøknad: true,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.FEIL);
        expect(valideringsresultat.feilmelding).toEqual('F.o.m må settes tidligere enn t.o.m');
    });

    test('Periode med fom-dato før barnets fødselsdato på oppfylt periode gir feil', () => {
        const periode: FeltState<IIsoDatoPeriode> = nyFeltState(nyIsoDatoPeriode('1999-05-17', '2018-05-17'));
        const valideringsresultat = erPeriodeGyldig(periode, VilkårType.LOVLIG_OPPHOLD, {
            person: lagGrunnlagPerson(),
            erEksplisittAvslagPåSøknad: false,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.FEIL);
        expect(valideringsresultat.feilmelding).toEqual('Du kan ikke legge til periode før barnets fødselsdato');
    });

    test('Periode med tom-dato etter barnets dødsfalldato gir feil', () => {
        const periode: FeltState<IIsoDatoPeriode> = nyFeltState(nyIsoDatoPeriode('2000-05-17', '2021-05-17'));
        const valideringsresultat = erPeriodeGyldig(periode, VilkårType.LOVLIG_OPPHOLD, {
            person: lagGrunnlagPerson({ dødsfallDato: '2020-12-12' }),
            erEksplisittAvslagPåSøknad: true,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.FEIL);
        expect(valideringsresultat.feilmelding).toEqual('Du kan ikke sette til og med dato etter dødsfalldato');
    });

    test('Periode med fom-dato lik som tom-dato skal ikke være mulig dersom det ikke er barnets dødsfallsdato', () => {
        const periode: FeltState<IIsoDatoPeriode> = nyFeltState(nyIsoDatoPeriode('2020-12-12', '2020-12-12'));
        const valideringsresultat = erPeriodeGyldig(periode, VilkårType.LOVLIG_OPPHOLD, {
            person: lagGrunnlagPerson(),
            erEksplisittAvslagPåSøknad: false,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.FEIL);
        expect(valideringsresultat.feilmelding).toEqual('F.o.m må settes tidligere enn t.o.m');
    });

    test('Periode med fom-dato lik som tom-dato skal være mulig dersom det er barnets dødsfallsdato', () => {
        const periode: FeltState<IIsoDatoPeriode> = nyFeltState(nyIsoDatoPeriode('2020-12-12', '2020-12-12'));
        const valideringsresultat = erPeriodeGyldig(periode, VilkårType.LOVLIG_OPPHOLD, {
            person: lagGrunnlagPerson({ dødsfallDato: '2020-12-12' }),
            erEksplisittAvslagPåSøknad: false,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.OK);
    });

    test('Periode etter barnets fødselsdato pluss 2 år gir feil på BarnetsAlder-vilkåret dersom vilkår er før lovendring 2024', () => {
        const periode: FeltState<IIsoDatoPeriode> = nyFeltState(nyIsoDatoPeriode('2001-05-17', '2018-05-17'));
        const valideringsresultat = erPeriodeGyldig(periode, VilkårType.BARNETS_ALDER, {
            person: lagGrunnlagPerson(),
            erEksplisittAvslagPåSøknad: false,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.FEIL);
        expect(valideringsresultat.feilmelding).toEqual('T.o.m datoen må være lik barnets 2 års dag');
    });

    test('Periode etter barnets fødselsdato pluss 19 måneder gir feil på BarnetsAlder-vilkåret dersom vilkår er etter lovendring-2024', () => {
        const periode: FeltState<IIsoDatoPeriode> = nyFeltState(nyIsoDatoPeriode('2024-08-01', '2024-12-01'));
        const valideringsresultat = erPeriodeGyldig(periode, VilkårType.BARNETS_ALDER, {
            person: lagGrunnlagPerson({ fødselsdato: '2023-05-17' }),
            erEksplisittAvslagPåSøknad: false,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.FEIL);
        expect(valideringsresultat.feilmelding).toEqual('T.o.m datoen må være lik datoen barnet fyller 19 måneder');
    });

    test('Periode etter barnets fødselsdato gir ok på andre vilkår', () => {
        const periode: FeltState<IIsoDatoPeriode> = nyFeltState(nyIsoDatoPeriode('2001-05-17', '2018-05-18'));
        const valideringsresultat = erPeriodeGyldig(periode, VilkårType.LOVLIG_OPPHOLD, {
            person: lagGrunnlagPerson(),
            erEksplisittAvslagPåSøknad: false,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.OK);
    });

    test('Fom som settes til senere enn inneværende måned på barnehageplass vilkår skal gi OK', () => {
        const nesteMåned = addMonths(new Date(), 1);
        const nesteMånedOgEnDag = addDays(nesteMåned, 1);

        const periode: FeltState<IIsoDatoPeriode> = nyFeltState(
            nyIsoDatoPeriode(
                formatISO(nesteMåned, { representation: 'date' }),
                formatISO(nesteMånedOgEnDag, { representation: 'date' })
            )
        );

        const valideringsresultat = erPeriodeGyldig(periode, VilkårType.BARNEHAGEPLASS, {
            person: lagGrunnlagPerson(),
            erEksplisittAvslagPåSøknad: false,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.OK);
    });

    test('Fom som settes til senere enn inneværende måned på andre vilkår enn barnehageplass skal gi FEIL', () => {
        const nesteMåned = addMonths(new Date(), 1);
        const nesteMånedOgEnDag = addDays(nesteMåned, 1);

        const periode: FeltState<IIsoDatoPeriode> = nyFeltState(
            nyIsoDatoPeriode(
                formatISO(nesteMåned, { representation: 'date' }),
                formatISO(nesteMånedOgEnDag, { representation: 'date' })
            )
        );

        const valideringsresultat = erPeriodeGyldig(periode, VilkårType.MEDLEMSKAP_ANNEN_FORELDER, {
            person: lagGrunnlagPerson(),
            erEksplisittAvslagPåSøknad: false,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.FEIL);
    });

    test('Periode med innenfor 1-2 år gir ok på BarnetsAlder-vilkåret dersom vilkår er før lovendring 2024', () => {
        const periode: FeltState<IIsoDatoPeriode> = nyFeltState(nyIsoDatoPeriode('2001-05-17', '2002-05-17'));
        const valideringsresultat = erPeriodeGyldig(periode, VilkårType.BARNETS_ALDER, {
            person: lagGrunnlagPerson(),
            erEksplisittAvslagPåSøknad: false,
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.OK);
    });

    test('Periode innenfor 6mnd etter lovendring 2024 gir ok for adopsjon', () => {
        const periode: FeltState<IIsoDatoPeriode> = nyFeltState(nyIsoDatoPeriode('2024-10-28', '2025-04-28'));
        const valideringsresultat = erPeriodeGyldig(periode, VilkårType.BARNETS_ALDER, {
            person: lagGrunnlagPerson({ fødselsdato: '2023-05-17' }),
            erEksplisittAvslagPåSøknad: false,
            førsteLagredeFom: undefined,
            utdypendeVilkårsvurdering: [UtdypendeVilkårsvurderingGenerell.ADOPSJON],
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.OK);
    });

    test('Periode lengre enn 6mnd etter lovendring 2024 gir feil for adopsjon', () => {
        const periode: FeltState<IIsoDatoPeriode> = nyFeltState(nyIsoDatoPeriode('2024-10-28', '2025-05-28'));
        const valideringsresultat = erPeriodeGyldig(periode, VilkårType.BARNETS_ALDER, {
            person: lagGrunnlagPerson({ fødselsdato: '2023-05-17' }),
            erEksplisittAvslagPåSøknad: false,
            førsteLagredeFom: undefined,
            utdypendeVilkårsvurdering: [UtdypendeVilkårsvurderingGenerell.ADOPSJON],
        });
        expect(valideringsresultat.valideringsstatus).toEqual(Valideringsstatus.FEIL);
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
