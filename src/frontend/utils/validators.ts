import {
    addMonths,
    addYears,
    endOfMonth,
    isAfter,
    isBefore,
    isEqual,
    isSameDay,
    isValid,
    parseISO,
    setMonth,
    subDays,
} from 'date-fns';

import type { Avhengigheter, FeltState } from '@navikt/familie-skjema';
import { feil, ok, Valideringsstatus } from '@navikt/familie-skjema';
import { idnr } from '@navikt/fnrvalidator';

import {
    dagensDato,
    datoForLovendringAugust24,
    type IIsoDatoPeriode,
    type IsoDatoString,
    isoStringTilDate,
} from './dato';
import { utledLovverk } from './lovverk';
import { erBegrunnelsePåkrevd } from '../komponenter/Fagsak/Vilkårsvurdering/GeneriskVilkår/VilkårSkjema';
import { Lovverk } from '../typer/lovverk';
import type { IGrunnlagPerson } from '../typer/person';
import { PersonType } from '../typer/person';
import { IEndretUtbetalingAndelÅrsak } from '../typer/utbetalingAndel';
import type { Begrunnelse } from '../typer/vedtak';
import type { UtdypendeVilkårsvurdering } from '../typer/vilkår';
import { Resultat, UtdypendeVilkårsvurderingGenerell, VilkårType } from '../typer/vilkår';

const harFyltInnIdent = (felt: FeltState<string>): FeltState<string> => {
    return /^\d{11}$/.test(felt.verdi.replace(' ', ''))
        ? ok(felt)
        : feil(felt, 'Identen har ikke 11 tall');
};

const validerIdent = (felt: FeltState<string>): FeltState<string> => {
    return idnr(felt.verdi).status === 'valid' ? ok(felt) : feil(felt, 'Identen er ugyldig');
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

const datoErXAntallMånederEtterFødselsdato = (
    person: IGrunnlagPerson,
    dato: Date,
    antallMåneder: number
) => {
    const personsXÅrsdag = addMonths(isoStringTilDate(person.fødselsdato), antallMåneder);
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

const datoDifferanseMerEnnXAntallMåneder = (fom: Date, tom: Date, antallMåneder: number) => {
    const fomDatoPlussXAntallMåneder = addMonths(fom, antallMåneder);
    return isBefore(fomDatoPlussXAntallMåneder, tom);
};

const finnesDatoFørFødselsdato = (person: IGrunnlagPerson, fom: Date, tom?: Date) => {
    const fødselsdato = isoStringTilDate(person.fødselsdato);

    return isBefore(fom, fødselsdato) || (tom ? isBefore(tom, fødselsdato) : false);
};

const erNesteMånedEllerSenere = (dato: Date) => isAfter(dato, endOfMonth(dagensDato));

const erDatoForLovendringAugust24 = (dato: Date) => isEqual(dato, datoForLovendringAugust24);

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
                    const førsteLagredeFom: IsoDatoString | undefined =
                        avhengigheter?.førsteLagredeFom;

                    const førsteFomPåVilkåret: Date = førsteLagredeFom
                        ? isoStringTilDate(førsteLagredeFom)
                        : fom;

                    const erAdopsjon = utdypendeVilkårsvurdering?.includes(
                        UtdypendeVilkårsvurderingGenerell.ADOPSJON
                    );
                    if (!tom) {
                        return feil(felt, 'Det må registreres en t.o.m dato');
                    }

                    const adopsjonsdato: Date | undefined = avhengigheter?.adopsjonsdato;
                    const lovverk = utledLovverk(
                        isoStringTilDate(person.fødselsdato),
                        adopsjonsdato
                    );

                    if (erAdopsjon) {
                        if (tomEtterAugustÅretBarnetFyller6(person, tom)) {
                            return feil(
                                felt,
                                'Du kan ikke sette en t.o.m dato som er etter august året barnet fyller 6 år'
                            );
                        }

                        if (isBefore(tom, datoForLovendringAugust24)) {
                            if (tom && datoDifferanseMerEnn1År(fom, tom)) {
                                return feil(
                                    felt,
                                    'Differansen mellom f.o.m datoen og t.o.m datoen kan ikke være mer enn 1 år'
                                );
                            }
                        } else {
                            if (
                                tom &&
                                datoDifferanseMerEnnXAntallMåneder(førsteFomPåVilkåret, tom, 6)
                            ) {
                                return feil(
                                    felt,
                                    'Differansen mellom tidligste f.o.m.-dato og t.o.m.-datoen kan ikke være mer enn 6 måneder'
                                );
                            }
                        }
                    } else {
                        if (lovverk === Lovverk.LOVENDRING_FEBRUAR_2025) {
                            if (!datoErPersonsXÅrsdag(person, fom, 1)) {
                                return feil(felt, 'F.o.m datoen må være lik barnets 1 års dag');
                            }

                            if (
                                !datoErXAntallMånederEtterFødselsdato(person, tom, 20) &&
                                !datoErPersonsDødsfallsdag(person, tom)
                            ) {
                                return feil(
                                    felt,
                                    'T.o.m datoen må være lik datoen barnet fyller 20 måneder'
                                );
                            }
                        } else {
                            if (isBefore(tom, datoForLovendringAugust24)) {
                                if (!datoErPersonsXÅrsdag(person, fom, 1)) {
                                    return feil(felt, 'F.o.m datoen må være lik barnets 1 års dag');
                                }
                                if (
                                    tom &&
                                    !datoErPersonsXÅrsdag(person, tom, 2) &&
                                    !isSameDay(tom, subDays(datoForLovendringAugust24, 1)) &&
                                    !datoErPersonsDødsfallsdag(person, tom)
                                ) {
                                    return feil(felt, 'T.o.m datoen må være lik barnets 2 års dag');
                                }
                            } else {
                                if (
                                    !datoErXAntallMånederEtterFødselsdato(person, fom, 13) &&
                                    !isSameDay(fom, datoForLovendringAugust24)
                                ) {
                                    return feil(
                                        felt,
                                        'F.o.m datoen må være lik datoen barnet fyller 13 måneder'
                                    );
                                }
                                if (
                                    tom &&
                                    !datoErXAntallMånederEtterFødselsdato(person, tom, 19) &&
                                    !datoErPersonsDødsfallsdag(person, tom)
                                ) {
                                    return feil(
                                        felt,
                                        'T.o.m datoen må være lik datoen barnet fyller 19 måneder'
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }

        const fomDatoErFørTomDato = erUendelig(tom) || isBefore(fom, tom);
        const fomDatoErLikDødsfallDato =
            !!person?.dødsfallDato && isSameDay(fom, isoStringTilDate(person.dødsfallDato));

        switch (vilkår) {
            case VilkårType.BARNETS_ALDER:
                if (erNesteMånedEllerSenere(fom) && !erDatoForLovendringAugust24(fom)) {
                    return feil(
                        felt,
                        'Du kan ikke legge inn fra og med dato som er senere enn neste måned med mindre datoen er 01.08.24'
                    );
                }
                break;
            case VilkårType.BARNEHAGEPLASS:
                if (valgtDatoErSenereEnnNesteMåned(fom)) {
                    return feil(
                        felt,
                        'Du kan ikke legge inn fra og med dato som er senere enn neste måned'
                    );
                }
                break;
            case VilkårType.BOR_MED_SØKER:
            case VilkårType.BOSATT_I_RIKET:
            case VilkårType.LOVLIG_OPPHOLD:
            case VilkårType.MEDLEMSKAP:
            case VilkårType.MEDLEMSKAP_ANNEN_FORELDER:
                if (erNesteMånedEllerSenere(fom)) {
                    return feil(
                        felt,
                        'Du kan ikke legge inn fra og med dato som er neste måned eller senere'
                    );
                }
        }

        if (!erUendelig(tom)) {
            if (!erBarnetsAlderVilkår && valgtDatoErSenereEnnNesteMåned(tom)) {
                const skalTillateFramtidigOpphør =
                    erBarnehageVilkår && søkerHarMeldtFraOmBarnehageplass;

                if (!skalTillateFramtidigOpphør) {
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

export const erAvslagBegrunnelseGyldig = (
    felt: FeltState<Begrunnelse[] | undefined>,
    avhengigheter?: Avhengigheter
): FeltState<Begrunnelse[] | undefined> => {
    const erEksplisittAvslagPåSøknad = avhengigheter?.erEksplisittAvslagPåSøknad;
    const årsak = avhengigheter?.årsak.verdi;
    const erAlleredeUtbetalt = årsak === IEndretUtbetalingAndelÅrsak.ALLEREDE_UTBETALT;

    if (erAlleredeUtbetalt && erEksplisittAvslagPåSøknad && !felt.verdi) {
        return feil(felt, 'Du må velge en begrunnelse ved avslag');
    }
    if (erAlleredeUtbetalt && erEksplisittAvslagPåSøknad && felt.verdi && felt.verdi.length === 0) {
        return feil(felt, 'Du må velge en begrunnelse ved avslag');
    }

    return ok(felt);
};

export const erPositivtHeltall = (string: string) => {
    const tall = Number(string);

    return Number.isInteger(tall) && tall > 0;
};

export const erLik0 = (string: string) => {
    const tall = Number(string);

    return Number.isInteger(tall) && tall === 0;
};

export const erBegrunnelseGyldig = (
    felt: FeltState<string>,
    avhengigheter?: Avhengigheter
): FeltState<string> => {
    if (!avhengigheter) {
        return feil(felt, 'Begrunnelse er ugyldig');
    }

    const begrunnelseOppgitt = felt.verdi.length > 0;

    if (
        erBegrunnelsePåkrevd(
            avhengigheter.vurderesEtter,
            avhengigheter.utdypendeVilkårsvurderinger,
            avhengigheter.personType,
            avhengigheter.vilkårType,
            avhengigheter.søkerHarMeldtFraOmBarnehageplass
        )
    ) {
        return begrunnelseOppgitt ? ok(felt) : feil(felt, 'Du må fylle inn en begrunnelse');
    } else {
        return ok(felt);
    }
};
