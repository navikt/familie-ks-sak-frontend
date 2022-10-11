import {
    type Avhengigheter,
    feil,
    type FeltState,
    ok,
    Valideringsstatus,
} from '@navikt/familie-skjema';

import type { IGrunnlagPerson } from '../typer/person';
import { PersonType } from '../typer/person';
import type { VedtakBegrunnelse } from '../typer/vedtak';
import { Resultat, UtdypendeVilkårsvurdering } from '../typer/vilkår';
import familieDayjs from './familieDayjs';
import type { IPeriode } from './kalender';
import {
    erEtter,
    erFør,
    erIsoStringGyldig,
    erSamme,
    kalenderDato,
    kalenderDatoMedFallback,
    KalenderEnhet,
    leggTil,
    TIDENES_ENDE,
    TIDENES_MORGEN,
    valgtDatoErNesteMånedEllerSenere,
} from './kalender';

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

const harFyltInnOrgnr = (felt: FeltState<string>): FeltState<string> => {
    return /^\d{9}$/.test(felt.verdi.replace(' ', ''))
        ? ok(felt)
        : feil(felt, 'Orgnummer har ikke 9 tall');
};

export const orgnummerValidator = (orgnummerFelt: FeltState<string>): FeltState<string> => {
    const validated = harFyltInnOrgnr(orgnummerFelt);
    if (validated.valideringsstatus !== Valideringsstatus.OK) {
        return validated;
    }

    return ok(orgnummerFelt);
};

const tomEtterAugustÅretBarnetFyller6 = (person: IGrunnlagPerson, tom?: string): boolean => {
    const datoAugustÅretBarnetFyller6 = leggTil(
        kalenderDato(person.fødselsdato),
        6,
        KalenderEnhet.ÅR
    );
    datoAugustÅretBarnetFyller6.måned = 7;
    const tomDato = tom ? kalenderDato(tom) : undefined;
    return tomDato ? erEtter(tomDato, datoAugustÅretBarnetFyller6) : false;
};

const datoErPersonsXÅrsdag = (person: IGrunnlagPerson, datoString: string, antallÅr: number) => {
    const personsXÅrsdag = leggTil(kalenderDato(person.fødselsdato), antallÅr, KalenderEnhet.ÅR);
    return erSamme(kalenderDato(datoString), personsXÅrsdag);
};

const datoDifferanseUlik1År = (fom: string, tom: string) => {
    const fomDatoPluss1År = leggTil(kalenderDato(fom), 1, KalenderEnhet.ÅR);
    const tomDato = kalenderDato(tom);
    return !erSamme(fomDatoPluss1År, tomDato);
};

const finnesDatoFørFødselsdato = (person: IGrunnlagPerson, fom: string, tom?: string) => {
    const fødselsdato = kalenderDato(person.fødselsdato);
    const fomDato = kalenderDato(fom);
    const tomDato = tom ? kalenderDato(tom) : undefined;

    return erFør(fomDato, fødselsdato) || (tomDato ? erFør(tomDato, fødselsdato) : false);
};

export const erPeriodeGyldig = (
    felt: FeltState<IPeriode>,
    avhengigheter?: Avhengigheter
): FeltState<IPeriode> => {
    const fom = felt.verdi.fom;
    const tom = felt.verdi.tom;

    const person: IGrunnlagPerson | undefined = avhengigheter?.person;
    const erEksplisittAvslagPåSøknad: boolean | undefined =
        avhengigheter?.erEksplisittAvslagPåSøknad;
    const erMellom1Og2EllerAdoptertVilkår: boolean | undefined =
        avhengigheter?.erMellom1Og2EllerAdoptertVilkår;

    const utdypendeVilkårsvurdering: UtdypendeVilkårsvurdering | undefined =
        avhengigheter?.utdypendeVilkårsvurdering;

    if (fom) {
        if (!erIsoStringGyldig(fom)) {
            return feil(felt, 'Ugyldig f.o.m.');
        } else if (tom && !erIsoStringGyldig(tom)) {
            return feil(felt, 'Ugyldig t.o.m.');
        }

        if (!erEksplisittAvslagPåSøknad) {
            if (person && person.type === PersonType.BARN) {
                if (finnesDatoFørFødselsdato(person, fom, tom)) {
                    return feil(felt, 'Du kan ikke legge til periode før barnets fødselsdato');
                }
                if (erMellom1Og2EllerAdoptertVilkår) {
                    if (utdypendeVilkårsvurdering?.includes(UtdypendeVilkårsvurdering.ADOPSJON)) {
                        if (tom && datoDifferanseUlik1År(fom, tom)) {
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
                        if (tom && !datoErPersonsXÅrsdag(person, tom, 2)) {
                            return feil(felt, 'T.o.m datoen må være lik barnets 2 års dag');
                        }
                    }
                }
            }
        }

        const tomKalenderDato = kalenderDatoMedFallback(tom, TIDENES_ENDE);
        const fomDatoErFørTomDato = erFør(
            kalenderDatoMedFallback(fom, TIDENES_MORGEN),
            tomKalenderDato
        );
        const fomDatoErLikDødsfallDato = fom === person?.dødsfallDato;

        const idag = kalenderDatoMedFallback(familieDayjs().toISOString(), TIDENES_ENDE);
        if (
            tom &&
            !erMellom1Og2EllerAdoptertVilkår &&
            valgtDatoErNesteMånedEllerSenere(tomKalenderDato, idag)
        ) {
            return feil(
                felt,
                'Du kan ikke legge inn til og med dato som er i neste måned eller senere'
            );
        }

        if (tom && person?.dødsfallDato) {
            const dødsfallKalenderDato = kalenderDato(person.dødsfallDato);

            if (erEtter(tomKalenderDato, dødsfallKalenderDato)) {
                return feil(felt, 'Du kan ikke sette til og med dato etter dødsfalldato');
            }
        }

        return fomDatoErFørTomDato || fomDatoErLikDødsfallDato
            ? ok(felt)
            : feil(felt, 'F.o.m må settes tidligere enn t.o.m');
    } else {
        if (erEksplisittAvslagPåSøknad) {
            return !tom
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
    felt: FeltState<VedtakBegrunnelse[]>,
    avhengigheter?: Avhengigheter
): FeltState<VedtakBegrunnelse[]> => {
    const erEksplisittAvslagPåSøknad: boolean | undefined =
        avhengigheter?.erEksplisittAvslagPåSøknad;
    return erEksplisittAvslagPåSøknad && !felt.verdi.length
        ? feil(felt, 'Du må velge minst en begrunnelse ved avslag')
        : ok(felt);
};
