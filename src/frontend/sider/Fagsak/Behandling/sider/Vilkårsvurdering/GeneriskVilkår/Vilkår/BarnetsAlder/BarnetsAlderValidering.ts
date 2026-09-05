import { Lovverk } from '@typer/lovverk';
import type { IGrunnlagPerson } from '@typer/person';
import { datoForLovendringAugust24, type IsoDatoString, isoStringTilDate } from '@utils/dato';
import { utledLovverk } from '@utils/lovverk';
import { addMonths, addYears, isAfter, isBefore, isSameDay, isValid, setMonth, subDays } from 'date-fns';

export function validerAdopsjonsdato(adopsjonsdato: Date | null | undefined, fødselsdato: Date): string | undefined {
    if (!adopsjonsdato || !isValid(adopsjonsdato)) {
        return 'Adopsjonsdato må fylles ut når adopsjon er valgt';
    }
    if (isBefore(adopsjonsdato, fødselsdato)) {
        return 'Adopsjonsdato kan ikke være tidligere enn fødselsdato';
    }
    return undefined;
}

const tomEtterAugustÅretBarnetFyller6 = (person: IGrunnlagPerson, tom: Date): boolean => {
    const datoBarnetFyller6 = addYears(isoStringTilDate(person.fødselsdato), 6);
    const datoSeptemberÅretBarnetFyller6 = setMonth(datoBarnetFyller6, 8);
    return isAfter(tom, datoSeptemberÅretBarnetFyller6);
};

const datoDifferanseMerEnnXAntallMåneder = (fom: Date, tom: Date, antallMåneder: number) =>
    isBefore(addMonths(fom, antallMåneder), tom);

const datoErPersonsXÅrsdag = (person: IGrunnlagPerson, dato: Date, antallÅr: number) =>
    isSameDay(dato, addYears(isoStringTilDate(person.fødselsdato), antallÅr));

const datoErXAntallMånederEtterFødselsdato = (person: IGrunnlagPerson, dato: Date, antallMåneder: number) =>
    isSameDay(dato, addMonths(isoStringTilDate(person.fødselsdato), antallMåneder));

const datoErPersonsDødsfallsdag = (person: IGrunnlagPerson, dato: Date) =>
    !!person.dødsfallDato && isSameDay(dato, isoStringTilDate(person.dødsfallDato));

interface ValiderAdopsjonPåBarnetsAlderProps {
    person: IGrunnlagPerson;
    adopsjonsdato: Date | null | undefined;
    lovverk: Lovverk;
    fom: Date;
    tom: Date;
    førsteFomPåVilkåret: Date;
}

function validerAdopsjonPåBarnetsAlder({
    person,
    adopsjonsdato,
    lovverk,
    fom,
    tom,
    førsteFomPåVilkåret,
}: ValiderAdopsjonPåBarnetsAlderProps): string | undefined {
    if (tomEtterAugustÅretBarnetFyller6(person, tom)) {
        return 'Du kan ikke sette en t.o.m dato som er etter august året barnet fyller 6 år';
    }

    if (adopsjonsdato && isBefore(fom, adopsjonsdato)) {
        return 'F.o.m.-datoen kan ikke være før adopsjonsdatoen';
    }

    switch (lovverk) {
        case Lovverk.LOVENDRING_FEBRUAR_2025:
            if (datoDifferanseMerEnnXAntallMåneder(fom, tom, 8)) {
                return 'Differansen mellom f.o.m.-dato og t.o.m.-datoen kan ikke være mer enn 8 måneder';
            }
            return undefined;
        case Lovverk.FØR_LOVENDRING_2025:
            if (isBefore(tom, datoForLovendringAugust24)) {
                if (datoDifferanseMerEnnXAntallMåneder(fom, tom, 12)) {
                    return 'Differansen mellom f.o.m datoen og t.o.m datoen kan ikke være mer enn 1 år';
                }
            } else if (datoDifferanseMerEnnXAntallMåneder(førsteFomPåVilkåret, tom, 6)) {
                return 'Differansen mellom tidligste f.o.m.-dato og t.o.m.-datoen kan ikke være mer enn 6 måneder';
            }
            return undefined;
    }
}

interface ValiderPeriodePåBarnetsAlderProps {
    person: IGrunnlagPerson;
    adopsjonsdato: Date | null | undefined;
    erAdopsjon: boolean;
    fom: Date;
    tom?: Date;
    førsteLagredeFom?: IsoDatoString;
}

export function validerPeriodePåBarnetsAlder({
    person,
    adopsjonsdato,
    erAdopsjon,
    fom,
    tom,
    førsteLagredeFom,
}: ValiderPeriodePåBarnetsAlderProps): string | undefined {
    if (!tom) {
        return 'Det må registreres en t.o.m dato';
    }

    const lovverk = utledLovverk(
        isoStringTilDate(person.fødselsdato),
        erAdopsjon ? (adopsjonsdato ?? undefined) : undefined
    );

    if (erAdopsjon) {
        return validerAdopsjonPåBarnetsAlder({
            person,
            adopsjonsdato,
            lovverk,
            fom,
            tom,
            førsteFomPåVilkåret: førsteLagredeFom ? isoStringTilDate(førsteLagredeFom) : fom,
        });
    }

    switch (lovverk) {
        case Lovverk.LOVENDRING_FEBRUAR_2025:
            if (!datoErPersonsXÅrsdag(person, fom, 1)) {
                return 'F.o.m datoen må være lik barnets 1 års dag';
            }
            if (!datoErXAntallMånederEtterFødselsdato(person, tom, 20) && !datoErPersonsDødsfallsdag(person, tom)) {
                return 'T.o.m datoen må være lik datoen barnet fyller 20 måneder';
            }
            return undefined;
        case Lovverk.FØR_LOVENDRING_2025:
            if (isBefore(tom, datoForLovendringAugust24)) {
                if (!datoErPersonsXÅrsdag(person, fom, 1)) {
                    return 'F.o.m datoen må være lik barnets 1 års dag';
                }
                if (
                    !datoErPersonsXÅrsdag(person, tom, 2) &&
                    !isSameDay(tom, subDays(datoForLovendringAugust24, 1)) &&
                    !datoErPersonsDødsfallsdag(person, tom)
                ) {
                    return 'T.o.m datoen må være lik barnets 2 års dag';
                }
                return undefined;
            }
            if (!datoErXAntallMånederEtterFødselsdato(person, fom, 13) && !isSameDay(fom, datoForLovendringAugust24)) {
                return 'F.o.m datoen må være lik datoen barnet fyller 13 måneder';
            }
            if (!datoErXAntallMånederEtterFødselsdato(person, tom, 19) && !datoErPersonsDødsfallsdag(person, tom)) {
                return 'T.o.m datoen må være lik datoen barnet fyller 19 måneder';
            }
            return undefined;
    }
}
