import type { IGrunnlagPerson } from '@typer/person';
import { PersonType } from '@typer/person';
import type { Begrunnelse } from '@typer/vedtak';
import {
    Regelverk,
    Resultat,
    type UtdypendeVilkårsvurdering,
    UtdypendeVilkårsvurderingGenerell,
    VilkårType,
} from '@typer/vilkår';
import { hentDagensDato, type IIsoDatoPeriode, type IsoDatoString, isoStringTilDate } from '@utils/dato';
import { tellAntallDesimaler } from '@utils/eøsValidators';
import { addMonths, endOfMonth, isAfter, isBefore, isSameDay, isValid, parseISO } from 'date-fns';

import { validerPeriodePåBarnetsAlder } from './GeneriskVilkår/Vilkår/BarnetsAlder/BarnetsAlderValidering';

interface PeriodeAvhengigheter {
    person: IGrunnlagPerson;
    erEksplisittAvslagPåSøknad: boolean;
    resultat?: Resultat;
    utdypendeVilkårsvurderinger?: UtdypendeVilkårsvurdering[];
    søkerHarMeldtFraOmBarnehageplass?: boolean;
    adopsjonsdato?: Date | null;
    førsteLagredeFom?: IsoDatoString;
}

const finnesDatoFørFødselsdato = (person: IGrunnlagPerson, fom: Date, tom?: Date) => {
    const fødselsdato = isoStringTilDate(person.fødselsdato);
    return isBefore(fom, fødselsdato) || (tom ? isBefore(tom, fødselsdato) : false);
};

const erNesteMånedEllerSenere = (dato: Date) => isAfter(dato, endOfMonth(hentDagensDato()));

const valgtDatoErSenereEnnNesteMåned = (valgtDato: Date) =>
    isAfter(valgtDato, endOfMonth(addMonths(hentDagensDato(), 1)));

export function validerPeriode(
    periode: IIsoDatoPeriode,
    vilkårType: VilkårType,
    {
        person,
        erEksplisittAvslagPåSøknad,
        resultat,
        utdypendeVilkårsvurderinger = [],
        søkerHarMeldtFraOmBarnehageplass = false,
        adopsjonsdato,
        førsteLagredeFom,
    }: PeriodeAvhengigheter
): string | undefined {
    const erBarnetsAlderVilkår = vilkårType === VilkårType.BARNETS_ALDER;
    const erBarnehageVilkår = vilkårType === VilkårType.BARNEHAGEPLASS;
    const erMedlemskapAnnenForelderVilkår = vilkårType === VilkårType.MEDLEMSKAP_ANNEN_FORELDER;

    if (erMedlemskapAnnenForelderVilkår && resultat === Resultat.IKKE_AKTUELT) {
        return undefined;
    }

    if (!periode.fom) {
        if (erEksplisittAvslagPåSøknad) {
            return periode.tom ? 'F.o.m. må settes eller t.o.m. må fjernes før du kan gå videre' : undefined;
        }
        return 'F.o.m. må settes før du kan gå videre';
    }

    const fom = parseISO(periode.fom);
    const tom = periode.tom ? parseISO(periode.tom) : undefined;

    if (!isValid(fom)) {
        return 'Ugyldig f.o.m.';
    }
    if (tom && !isValid(tom)) {
        return 'Ugyldig t.o.m.';
    }

    if (!erEksplisittAvslagPåSøknad && person.type === PersonType.BARN && !erMedlemskapAnnenForelderVilkår) {
        if (finnesDatoFørFødselsdato(person, fom, tom)) {
            return 'Du kan ikke legge til periode før barnets fødselsdato';
        }
        if (erBarnetsAlderVilkår) {
            const feilPåBarnetsAlder = validerPeriodePåBarnetsAlder({
                person,
                adopsjonsdato,
                erAdopsjon: utdypendeVilkårsvurderinger.includes(UtdypendeVilkårsvurderingGenerell.ADOPSJON),
                fom,
                tom,
                førsteLagredeFom,
            });
            if (feilPåBarnetsAlder !== undefined) {
                return feilPåBarnetsAlder;
            }
        }
    }

    if (erBarnehageVilkår) {
        if (valgtDatoErSenereEnnNesteMåned(fom)) {
            return 'Du kan ikke legge inn fra og med dato som er senere enn neste måned';
        }
    } else if (erNesteMånedEllerSenere(fom)) {
        return 'Du kan ikke legge inn fra og med dato som er neste måned eller senere';
    }

    if (tom) {
        if (!erBarnetsAlderVilkår && valgtDatoErSenereEnnNesteMåned(tom)) {
            const skalTillateFramtidigOpphør = erBarnehageVilkår && søkerHarMeldtFraOmBarnehageplass;
            if (!skalTillateFramtidigOpphør) {
                return 'Du kan ikke legge inn til og med dato som er senere enn neste måned';
            }
        }
        if (person.dødsfallDato && isAfter(tom, isoStringTilDate(person.dødsfallDato))) {
            return 'Du kan ikke sette til og med dato etter dødsfalldato';
        }
    }

    const fomDatoErFørTomDato = tom === undefined || isBefore(fom, tom);
    const fomDatoErLikDødsfallDato = !!person.dødsfallDato && isSameDay(fom, isoStringTilDate(person.dødsfallDato));

    return fomDatoErFørTomDato || fomDatoErLikDødsfallDato ? undefined : 'F.o.m må settes tidligere enn t.o.m';
}

export function validerResultat(resultat: Resultat): string | undefined {
    return resultat === Resultat.IKKE_VURDERT ? 'Resultat er ikke satt' : undefined;
}

interface AvslagBegrunnelserAvhengigheter {
    erEksplisittAvslagPåSøknad: boolean;
}

export function validerAvslagBegrunnelser(
    avslagBegrunnelser: Begrunnelse[],
    { erEksplisittAvslagPåSøknad }: AvslagBegrunnelserAvhengigheter
): string | undefined {
    return erEksplisittAvslagPåSøknad && avslagBegrunnelser.length === 0
        ? 'Du må velge minst en begrunnelse ved avslag'
        : undefined;
}

interface BegrunnelseAvhengigheter {
    vilkårType: VilkårType;
    vurderesEtter: Regelverk | null | undefined;
    utdypendeVilkårsvurderinger: UtdypendeVilkårsvurdering[];
    personType: PersonType;
    søkerHarMeldtFraOmBarnehageplass: boolean;
}

export function erBegrunnelsePåkrevd({
    vilkårType,
    vurderesEtter,
    utdypendeVilkårsvurderinger,
    personType,
    søkerHarMeldtFraOmBarnehageplass,
}: BegrunnelseAvhengigheter): boolean {
    return (
        (vilkårType === VilkårType.BARNEHAGEPLASS && søkerHarMeldtFraOmBarnehageplass) ||
        (vurderesEtter === Regelverk.NASJONALE_REGLER && utdypendeVilkårsvurderinger.length > 0) ||
        (vurderesEtter === Regelverk.EØS_FORORDNINGEN &&
            personType === PersonType.SØKER &&
            vilkårType === VilkårType.BOSATT_I_RIKET)
    );
}

export function validerBegrunnelse(begrunnelse: string, avhengigheter: BegrunnelseAvhengigheter): string | undefined {
    return erBegrunnelsePåkrevd(avhengigheter) && begrunnelse.length === 0
        ? 'Du må fylle inn en begrunnelse'
        : undefined;
}

export function validerBegrunnelseForBarnetsAlder(
    begrunnelse: string,
    {
        vurderesEtter,
        utdypendeVilkårsvurderinger,
    }: Pick<BegrunnelseAvhengigheter, 'vurderesEtter' | 'utdypendeVilkårsvurderinger'>
): string | undefined {
    if (vurderesEtter === Regelverk.EØS_FORORDNINGEN) {
        return undefined;
    }
    if (begrunnelse.length > 0 || utdypendeVilkårsvurderinger.length === 0) {
        return undefined;
    }
    return 'Du har gjort ett eller flere valg under "Utdypende vilkårsvurdering" og må derfor fylle inn en begrunnelse';
}

interface UtdypendeVilkårsvurderingerAvhengigheter {
    vilkårType: VilkårType;
    muligeUtdypendeVilkårsvurderinger: UtdypendeVilkårsvurdering[];
    vurderesEtter: Regelverk | null | undefined;
}

export function validerUtdypendeVilkårsvurderinger(
    utdypendeVilkårsvurderinger: UtdypendeVilkårsvurdering[],
    { vilkårType, muligeUtdypendeVilkårsvurderinger, vurderesEtter }: UtdypendeVilkårsvurderingerAvhengigheter
): string | undefined {
    const kreverRegelverk = vilkårType === VilkårType.BOR_MED_SØKER;
    const kreverEttValgVedEøs = vilkårType === VilkårType.BOR_MED_SØKER || vilkårType === VilkårType.BOSATT_I_RIKET;

    if (kreverRegelverk && !vurderesEtter) {
        return 'Utdypende vilkårsvurdering er ugyldig';
    }
    if (muligeUtdypendeVilkårsvurderinger.length === 0) {
        return undefined;
    }
    if (!utdypendeVilkårsvurderinger.every(item => muligeUtdypendeVilkårsvurderinger.includes(item))) {
        return 'Du har valgt en ugyldig kombinasjon';
    }
    if (kreverEttValgVedEøs && vurderesEtter === Regelverk.EØS_FORORDNINGEN) {
        if (utdypendeVilkårsvurderinger.length === 0) {
            return 'Du må velge ett alternativ';
        }
        if (utdypendeVilkårsvurderinger.length > 1) {
            return 'Du kan kun velge ett alternativ';
        }
    }
    return undefined;
}

interface AntallTimerAvhengigheter {
    resultat: Resultat;
    utdypendeVilkårsvurderinger: UtdypendeVilkårsvurdering[];
}

export function validerAntallTimer(
    antallTimer: string,
    { resultat, utdypendeVilkårsvurderinger }: AntallTimerAvhengigheter
): string | undefined {
    if (antallTimer !== '') {
        const timer = Number(antallTimer);
        if (timer <= 0) {
            return 'Antall timer med barnehageplass må være større enn 0';
        }
        if (timer > 122) {
            return 'Antall timer med barnehageplass kan ikke overstige 122';
        }
        if (tellAntallDesimaler(antallTimer) > 2) {
            return 'Antall timer med barnehageplass kan maksimalt oppgis med 2 desimaler';
        }
        return undefined;
    }
    if (resultat !== Resultat.OPPFYLT && utdypendeVilkårsvurderinger.length === 0) {
        return 'Antall timer med barnehageplass må fylles ut';
    }
    return undefined;
}
