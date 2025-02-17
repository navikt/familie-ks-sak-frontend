import { addMonths, addYears, isAfter, isBefore, setMonth } from 'date-fns';

import type { Avhengigheter, FeltState } from '@navikt/familie-skjema';
import { feil, ok } from '@navikt/familie-skjema';

import { muligeUtdypendeVilkårsvurderinger } from './BarnetsAlderContext';
import { Lovverk } from '../../../../../../typer/lovverk';
import type { IGrunnlagPerson } from '../../../../../../typer/person';
import type { UtdypendeVilkårsvurdering } from '../../../../../../typer/vilkår';
import { Regelverk } from '../../../../../../typer/vilkår';
import {
    datoForLovendringAugust24,
    isoStringTilDate,
    type IIsoDatoPeriode,
} from '../../../../../../utils/dato';

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

export const erBegrunnelseGyldig = (
    felt: FeltState<string>,
    avhengigheter?: Avhengigheter
): FeltState<string> => {
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

const tomEtterAugustÅretBarnetFyller6 = (person: IGrunnlagPerson, tom?: Date): boolean => {
    const datoBarnetFyller6 = addYears(isoStringTilDate(person.fødselsdato), 6);
    const datoSeptemberÅretBarnetFyller6 = setMonth(datoBarnetFyller6, 8);
    return tom ? isAfter(tom, datoSeptemberÅretBarnetFyller6) : false;
};

const datoDifferanseMerEnnXAntallMåneder = (fom: Date, tom: Date, antallMåneder: number) => {
    const fomDatoPlussXAntallMåneder = addMonths(fom, antallMåneder);
    return isBefore(fomDatoPlussXAntallMåneder, tom);
};

export const validerAdopsjonPåBarnetsAlder = (
    felt: FeltState<IIsoDatoPeriode>,
    person: IGrunnlagPerson,
    adopsjonsdato: Date | undefined,
    lovverk: Lovverk,
    fom: Date,
    tom: Date,
    førsteFomPåVilkåret: Date
): FeltState<IIsoDatoPeriode> | undefined => {
    if (tomEtterAugustÅretBarnetFyller6(person, tom)) {
        return feil(
            felt,
            'Du kan ikke sette en t.o.m dato som er etter august året barnet fyller 6 år'
        );
    }

    if (adopsjonsdato && isBefore(fom, adopsjonsdato)) {
        return feil(felt, 'F.o.m.-datoen kan ikke være før adopsjonsdatoen');
    }

    switch (lovverk) {
        case Lovverk.LOVENDRING_FEBRUAR_2025:
            if (datoDifferanseMerEnnXAntallMåneder(fom, tom, 8)) {
                return feil(
                    felt,
                    'Differansen mellom f.o.m.-dato og t.o.m.-datoen kan ikke være mer enn 8 måneder'
                );
            }
            break;
        case Lovverk.FØR_LOVENDRING_2025:
            if (isBefore(tom, datoForLovendringAugust24)) {
                if (datoDifferanseMerEnnXAntallMåneder(fom, tom, 12)) {
                    return feil(
                        felt,
                        'Differansen mellom f.o.m datoen og t.o.m datoen kan ikke være mer enn 1 år'
                    );
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
