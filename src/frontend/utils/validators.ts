import {
    addMonths,
    addYears,
    endOfMonth,
    isAfter,
    isBefore,
    isSameDay,
    isValid,
    parseISO,
    setMonth,
} from 'date-fns';

import type { Avhengigheter, FeltState } from '@navikt/familie-skjema';
import { feil, ok, Valideringsstatus } from '@navikt/familie-skjema';

import type { IIsoDatoPeriode } from './dato';
import { dagensDato, isoStringTilDate } from './dato';
import type { IGrunnlagPerson } from '../typer/person';
import { PersonType } from '../typer/person';
import type { Begrunnelse } from '../typer/vedtak';
import type { UtdypendeVilkårsvurdering } from '../typer/vilkår';
import { Resultat, UtdypendeVilkårsvurderingGenerell, VilkårType } from '../typer/vilkår';

// eslint-disable-next-line
const validator = require('@navikt/fnrvalidator');

const harFyltInnIdent = (felt: FeltState<string>): FeltState<string> => {
    return /^\d{11}$/.test(felt.verdi.replace(' ', ''))
        ? ok(felt)
        : feil(felt, 'Identen har ikke 11 tall');
};

const validerIdent = (felt: FeltState<string>): FeltState<string> => {
    return validator.idnr(felt.verdi).status === 'valid'
        ? ok(felt)
        : feil(felt, 'Identen er ugyldig');
};

export const identValidator = (identFelt: FeltState<string>): FeltState<string> => {
    const validated = harFyltInnIdent(identFelt);
    if (validated.valideringsstatus !== Valideringsstatus.OK) {
        return validated;
    }

    return validerIdent(identFelt);
};

const tomEtterAugustÅretBarnetFyller6 = (person: IGrunnlagPerson, tom?: Date): boolean => {
    const datoBarnetFyller6 = addYears(isoStringTilDate(person.fødselsdato), 6);
    const datoSeptemberÅretBarnetFyller6 = setMonth(datoBarnetFyller6, 8);
    return tom ? isAfter(tom, datoSeptemberÅretBarnetFyller6) : false;
};

const datoErPersonsXÅrsdag = (person: IGrunnlagPerson, dato: Date, antallÅr: number) => {
    const personsXÅrsdag = addYears(isoStringTilDate(person.fødselsdato), antallÅr);
    return isSameDay(dato, personsXÅrsdag);
};

const datoErPersonsDødsfallsdag = (person: IGrunnlagPerson, dato: Date) => {
    const personsDødsfallsdag = person.dødsfallDato;

    return !!personsDødsfallsdag && isSameDay(dato, isoStringTilDate(personsDødsfallsdag));
};

const datoDifferanseMerEnn1År = (fom: Date, tom: Date) => {
    const fomDatoPluss1År = addYears(fom, 1);
    return isBefore(fomDatoPluss1År, tom);
};

const finnesDatoFørFødselsdato = (person: IGrunnlagPerson, fom: Date, tom?: Date) => {
    const fødselsdato = isoStringTilDate(person.fødselsdato);

    return isBefore(fom, fødselsdato) || (tom ? isBefore(tom, fødselsdato) : false);
};

const erNesteMånedEllerSenere = (dato: Date) => isAfter(dato, endOfMonth(dagensDato));

const erUendelig = (date: Date | undefined): date is undefined => date === undefined;

const valgtDatoErSenereEnnNesteMåned = (valgtDato: Date) =>
    isAfter(valgtDato, endOfMonth(addMonths(dagensDato, 1)));

export const erPeriodeGyldig = (
    felt: FeltState<IIsoDatoPeriode>,
    vilkår: VilkårType,
    avhengigheter?: Avhengigheter
): FeltState<IIsoDatoPeriode> => {
    const person: IGrunnlagPerson | undefined = avhengigheter?.person;
    const erEksplisittAvslagPåSøknad: boolean | undefined =
        avhengigheter?.erEksplisittAvslagPåSøknad;
    const erBarnetsAlderVilkår: boolean = vilkår === VilkårType.BARNETS_ALDER;
    const erBarnehageVilkår: boolean = vilkår === VilkårType.BARNEHAGEPLASS;

    const erMedlemskapAnnenForelderVilkår: boolean =
        avhengigheter?.erMedlemskapAnnenForelderVilkår ?? false;

    const utdypendeVilkårsvurdering: UtdypendeVilkårsvurdering | undefined =
        avhengigheter?.utdypendeVilkårsvurdering;

    const søkerHarMeldtFraOmBarnehageplass: boolean | undefined =
        avhengigheter?.søkerHarMeldtFraOmBarnehageplass;

    if (felt.verdi.fom) {
        const fom = parseISO(felt.verdi.fom);
        const tom = felt.verdi.tom ? parseISO(felt.verdi.tom) : undefined;

        if (!isValid(fom)) {
            return feil(felt, 'Ugyldig f.o.m.');
        } else if (tom && !isValid(tom)) {
            return feil(felt, 'Ugyldig t.o.m.');
        }

        if (!erEksplisittAvslagPåSøknad) {
            if (person && person.type === PersonType.BARN && !erMedlemskapAnnenForelderVilkår) {
                if (finnesDatoFørFødselsdato(person, fom, tom)) {
                    return feil(felt, 'Du kan ikke legge til periode før barnets fødselsdato');
                }
                if (erBarnetsAlderVilkår) {
                    if (
                        utdypendeVilkårsvurdering?.includes(
                            UtdypendeVilkårsvurderingGenerell.ADOPSJON
                        )
                    ) {
                        if (tom && datoDifferanseMerEnn1År(fom, tom)) {
                            return feil(
                                felt,
                                'Differansen mellom f.o.m datoen og t.o.m datoen kan ikke være mer enn 1 år'
                            );
                        }
                        if (tomEtterAugustÅretBarnetFyller6(person, tom)) {
                            return feil(
                                felt,
                                'Du kan ikke sette en t.o.m dato som er etter august året barnet fyller 6 år'
                            );
                        }
                    } else {
                        if (!datoErPersonsXÅrsdag(person, fom, 1)) {
                            return feil(felt, 'F.o.m datoen må være lik barnets 1 års dag');
                        }
                        if (
                            tom &&
                            !datoErPersonsXÅrsdag(person, tom, 2) &&
                            !datoErPersonsDødsfallsdag(person, tom)
                        ) {
                            return feil(felt, 'T.o.m datoen må være lik barnets 2 års dag');
                        }
                    }
                }
            }
        }

        const fomDatoErFørTomDato = erUendelig(tom) || isBefore(fom, tom);
        const fomDatoErLikDødsfallDato =
            !!person?.dødsfallDato && isSameDay(fom, isoStringTilDate(person.dødsfallDato));

        if (
            vilkår === VilkårType.BARNEHAGEPLASS
                ? valgtDatoErSenereEnnNesteMåned(fom)
                : erNesteMånedEllerSenere(fom)
        ) {
            return feil(
                felt,
                `Du kan ikke legge inn fra og med dato som er ${
                    vilkår === VilkårType.BARNEHAGEPLASS
                        ? 'senere enn neste måned'
                        : 'neste måned eller senere'
                }`
            );
        }
        if (!erUendelig(tom)) {
            if (!erBarnetsAlderVilkår && valgtDatoErSenereEnnNesteMåned(tom)) {
                const skalTillateFremtidigOpphør =
                    erBarnehageVilkår && søkerHarMeldtFraOmBarnehageplass;

                if (!skalTillateFremtidigOpphør) {
                    return feil(
                        felt,
                        'Du kan ikke legge inn til og med dato som er senere enn neste måned'
                    );
                }
            }

            if (person?.dødsfallDato) {
                const dødsfalldato = isoStringTilDate(person.dødsfallDato);

                if (isAfter(tom, dødsfalldato)) {
                    return feil(felt, 'Du kan ikke sette til og med dato etter dødsfalldato');
                }
            }
        }

        return fomDatoErFørTomDato || fomDatoErLikDødsfallDato
            ? ok(felt)
            : feil(felt, 'F.o.m må settes tidligere enn t.o.m');
    } else {
        if (erEksplisittAvslagPåSøknad) {
            return !felt.verdi.tom
                ? ok(felt)
                : feil(felt, 'F.o.m. må settes eller t.o.m. må fjernes før du kan gå videre');
        } else {
            return feil(felt, 'F.o.m. må settes før du kan gå videre');
        }
    }
};

export const erResultatGyldig = (felt: FeltState<Resultat>): FeltState<Resultat> => {
    return felt.verdi !== Resultat.IKKE_VURDERT ? ok(felt) : feil(felt, 'Resultat er ikke satt');
};

export const erAvslagBegrunnelserGyldig = (
    felt: FeltState<Begrunnelse[]>,
    avhengigheter?: Avhengigheter
): FeltState<Begrunnelse[]> => {
    const erEksplisittAvslagPåSøknad: boolean | undefined =
        avhengigheter?.erEksplisittAvslagPåSøknad;
    return erEksplisittAvslagPåSøknad && !felt.verdi.length
        ? feil(felt, 'Du må velge minst en begrunnelse ved avslag')
        : ok(felt);
};

export const erPositivtHeltall = (string: string) => {
    const tall = Number(string);

    return Number.isInteger(tall) && tall > 0;
};

export const erLik0 = (string: string) => {
    const tall = Number(string);

    return Number.isInteger(tall) && tall === 0;
};
