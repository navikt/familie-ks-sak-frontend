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
import { Resultat } from '../typer/vilkår';
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

const finnesDatoEtterFødselsdatoPluss18 = (person: IGrunnlagPerson, fom: string, tom?: string) => {
    const fødselsdatoPluss18 = leggTil(kalenderDato(person.fødselsdato), 18, KalenderEnhet.ÅR);
    const fomDato = kalenderDato(fom);
    const tomDato = kalenderDatoMedFallback(tom, TIDENES_ENDE);
    return (
        erSamme(fomDato, fødselsdatoPluss18) ||
        erEtter(fomDato, fødselsdatoPluss18) ||
        (tomDato
            ? erSamme(tomDato, fødselsdatoPluss18) || erEtter(tomDato, fødselsdatoPluss18)
            : false)
    );
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
    const er18ÅrsVilkår: boolean | undefined = avhengigheter?.er18ÅrsVilkår;

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
                if (er18ÅrsVilkår && finnesDatoEtterFødselsdatoPluss18(person, fom, tom)) {
                    return feil(
                        felt,
                        'Du kan ikke legge til periode på dette vilkåret fra barnet har fylt 18 år'
                    );
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
        if (tom && !er18ÅrsVilkår && valgtDatoErNesteMånedEllerSenere(tomKalenderDato, idag)) {
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
