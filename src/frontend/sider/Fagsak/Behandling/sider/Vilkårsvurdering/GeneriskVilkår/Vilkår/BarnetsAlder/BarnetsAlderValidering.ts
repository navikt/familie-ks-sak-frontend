import { addMonths, addYears, isAfter, isBefore, isSameDay, isValid, setMonth, subDays } from 'date-fns';

import type { Avhengigheter, FeltState } from '@navikt/familie-skjema';
import { feil, ok } from '@navikt/familie-skjema';

import { muligeUtdypendeVilkårsvurderinger } from './BarnetsAlderContext';
import { Lovverk } from '../../../../../../../../typer/lovverk';
import type { IGrunnlagPerson } from '../../../../../../../../typer/person';
import type { UtdypendeVilkårsvurdering } from '../../../../../../../../typer/vilkår';
import { Regelverk } from '../../../../../../../../typer/vilkår';
import {
    datoForLovendringAugust24,
    isoStringTilDate,
    type IIsoDatoPeriode,
    type IsoDatoString,
} from '../../../../../../../../utils/dato';
import { utledLovverk } from '../../../../../../../../utils/lovverk';

export const erUtdypendeVilkårsvurderingerGyldig = (
    felt: FeltState<UtdypendeVilkårsvurdering[]>
): FeltState<UtdypendeVilkårsvurdering[]> => {
    if (muligeUtdypendeVilkårsvurderinger.length === 0) {
        return ok(felt);
    }
    if (!felt.verdi.every(item => muligeUtdypendeVilkårsvurderinger.includes(item))) {
        return feil(felt, 'Du har valgt en ugyldig kombinasjon');
    }

    return ok(felt);
};

export const erBegrunnelseGyldig = (felt: FeltState<string>, avhengigheter?: Avhengigheter): FeltState<string> => {
    if (!avhengigheter) {
        return feil(felt, 'Begrunnelse er ugyldig');
    }

    const begrunnelseOppgitt = felt.verdi.length > 0;

    if (avhengigheter.vurderesEtter === Regelverk.EØS_FORORDNINGEN) {
        return ok(felt);
    } else {
        if (begrunnelseOppgitt || avhengigheter?.utdypendeVilkårsvurdering.length === 0) {
            return ok(felt);
        }
        return feil(
            felt,
            'Du har gjort ett eller flere valg under "Utdypende vilkårsvurdering" og må derfor fylle inn en begrunnelse'
        );
    }
};

export const erAdopsjonsdatoGyldig = (
    felt: FeltState<Date | undefined>,
    fødselsdato: Date
): FeltState<Date | undefined> => {
    if (!felt.verdi || !isValid(felt.verdi)) {
        return feil(felt, 'Adopsjonsdato må fylles ut når adopsjon er valgt');
    } else if (isBefore(felt.verdi, fødselsdato)) {
        return feil(felt, 'Adopsjonsdato kan ikke være tidligere enn fødselsdato');
    } else {
        return ok(felt);
    }
};

const tomEtterAugustÅretBarnetFyller6 = (person: IGrunnlagPerson, tom?: Date): boolean => {
    const datoBarnetFyller6 = addYears(isoStringTilDate(person.fødselsdato), 6);
    const datoSeptemberÅretBarnetFyller6 = setMonth(datoBarnetFyller6, 8);
    return tom ? isAfter(tom, datoSeptemberÅretBarnetFyller6) : false;
};

const datoDifferanseMerEnnXAntallMåneder = (fom: Date, tom: Date, antallMåneder: number) => {
    const fomDatoPlussXAntallMåneder = addMonths(fom, antallMåneder);
    return isBefore(fomDatoPlussXAntallMåneder, tom);
};

const datoErPersonsXÅrsdag = (person: IGrunnlagPerson, dato: Date, antallÅr: number) => {
    const personsXÅrsdag = addYears(isoStringTilDate(person.fødselsdato), antallÅr);
    return isSameDay(dato, personsXÅrsdag);
};

const datoErXAntallMånederEtterFødselsdato = (person: IGrunnlagPerson, dato: Date, antallMåneder: number) => {
    const personsXÅrsdag = addMonths(isoStringTilDate(person.fødselsdato), antallMåneder);
    return isSameDay(dato, personsXÅrsdag);
};

const datoErPersonsDødsfallsdag = (person: IGrunnlagPerson, dato: Date) => {
    const personsDødsfallsdag = person.dødsfallDato;

    return !!personsDødsfallsdag && isSameDay(dato, isoStringTilDate(personsDødsfallsdag));
};

interface ValiderAdopsjonPåBarnetsAlderProps {
    felt: FeltState<IIsoDatoPeriode>;
    person: IGrunnlagPerson;
    adopsjonsdato: Date | undefined;
    lovverk: Lovverk;
    fom: Date;
    tom: Date;
    førsteFomPåVilkåret: Date;
}

export const validerAdopsjonPåBarnetsAlder = ({
    felt,
    person,
    adopsjonsdato,
    lovverk,
    fom,
    tom,
    førsteFomPåVilkåret,
}: ValiderAdopsjonPåBarnetsAlderProps): FeltState<IIsoDatoPeriode> | undefined => {
    if (tomEtterAugustÅretBarnetFyller6(person, tom)) {
        return feil(felt, 'Du kan ikke sette en t.o.m dato som er etter august året barnet fyller 6 år');
    }

    if (adopsjonsdato && isBefore(fom, adopsjonsdato)) {
        return feil(felt, 'F.o.m.-datoen kan ikke være før adopsjonsdatoen');
    }

    switch (lovverk) {
        case Lovverk.LOVENDRING_FEBRUAR_2025:
            if (datoDifferanseMerEnnXAntallMåneder(fom, tom, 8)) {
                return feil(felt, 'Differansen mellom f.o.m.-dato og t.o.m.-datoen kan ikke være mer enn 8 måneder');
            }
            break;
        case Lovverk.FØR_LOVENDRING_2025:
            if (isBefore(tom, datoForLovendringAugust24)) {
                if (datoDifferanseMerEnnXAntallMåneder(fom, tom, 12)) {
                    return feil(felt, 'Differansen mellom f.o.m datoen og t.o.m datoen kan ikke være mer enn 1 år');
                }
            } else {
                if (datoDifferanseMerEnnXAntallMåneder(førsteFomPåVilkåret, tom, 6)) {
                    return feil(
                        felt,
                        'Differansen mellom tidligste f.o.m.-dato og t.o.m.-datoen kan ikke være mer enn 6 måneder'
                    );
                }
            }
    }
};

interface ValiderPeriodePåBarnetsAlderProps {
    felt: FeltState<IIsoDatoPeriode>;
    person: IGrunnlagPerson;
    adopsjonsdato: Date | undefined;
    erAdopsjon: boolean;
    fom: Date;
    tom?: Date;
    førsteLagredeFom?: IsoDatoString;
}

export const validerPeriodePåBarnetsAlder = ({
    felt,
    person,
    adopsjonsdato,
    erAdopsjon,
    fom,
    tom,
    førsteLagredeFom,
}: ValiderPeriodePåBarnetsAlderProps): FeltState<IIsoDatoPeriode> | undefined => {
    if (!tom) {
        return feil(felt, 'Det må registreres en t.o.m dato');
    }

    const lovverk = utledLovverk(isoStringTilDate(person.fødselsdato), adopsjonsdato);

    if (erAdopsjon) {
        const feilMedAdopsjonPåBarnetsAlder = validerAdopsjonPåBarnetsAlder({
            felt,
            person,
            adopsjonsdato,
            lovverk,
            fom,
            tom,
            førsteFomPåVilkåret: førsteLagredeFom ? isoStringTilDate(førsteLagredeFom) : fom,
        });
        if (feilMedAdopsjonPåBarnetsAlder !== undefined) {
            return feilMedAdopsjonPåBarnetsAlder;
        }
    } else {
        switch (lovverk) {
            case Lovverk.LOVENDRING_FEBRUAR_2025:
                if (!datoErPersonsXÅrsdag(person, fom, 1)) {
                    return feil(felt, 'F.o.m datoen må være lik barnets 1 års dag');
                }

                if (!datoErXAntallMånederEtterFødselsdato(person, tom, 20) && !datoErPersonsDødsfallsdag(person, tom)) {
                    return feil(felt, 'T.o.m datoen må være lik datoen barnet fyller 20 måneder');
                }
                break;
            case Lovverk.FØR_LOVENDRING_2025:
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
                        return feil(felt, 'F.o.m datoen må være lik datoen barnet fyller 13 måneder');
                    }
                    if (
                        tom &&
                        !datoErXAntallMånederEtterFødselsdato(person, tom, 19) &&
                        !datoErPersonsDødsfallsdag(person, tom)
                    ) {
                        return feil(felt, 'T.o.m datoen må være lik datoen barnet fyller 19 måneder');
                    }
                }
        }
    }
};
