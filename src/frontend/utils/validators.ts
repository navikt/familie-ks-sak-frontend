import { addMonths, endOfMonth, isAfter, isBefore, isSameDay, isValid, parseISO } from 'date-fns';

import type { Avhengigheter, FeltState } from '@navikt/familie-skjema';
import { feil, ok, Valideringsstatus } from '@navikt/familie-skjema';
import { idnr } from '@navikt/fnrvalidator';

import { dagensDato, type IIsoDatoPeriode, isoStringTilDate } from './dato';
import { validerPeriodePåBarnetsAlder } from '../sider/Fagsak/Behandling/sider/Vilkårsvurdering/GeneriskVilkår/Vilkår/BarnetsAlder/BarnetsAlderValidering';
import { erBegrunnelsePåkrevd } from '../sider/Fagsak/Behandling/sider/Vilkårsvurdering/GeneriskVilkår/VilkårSkjema';
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
                    const feilPåBarnetsAlder = validerPeriodePåBarnetsAlder({
                        felt,
                        person,
                        adopsjonsdato: avhengigheter?.adopsjonsdato,
                        erAdopsjon:
                            utdypendeVilkårsvurdering?.includes(
                                UtdypendeVilkårsvurderingGenerell.ADOPSJON
                            ) ?? false,
                        fom,
                        tom,
                        førsteLagredeFom: avhengigheter?.førsteLagredeFom,
                    });

                    if (feilPåBarnetsAlder !== undefined) {
                        return feilPåBarnetsAlder;
                    }
                }
            }
        }

        const fomDatoErFørTomDato = erUendelig(tom) || isBefore(fom, tom);
        const fomDatoErLikDødsfallDato =
            !!person?.dødsfallDato && isSameDay(fom, isoStringTilDate(person.dødsfallDato));

        if (erNesteMånedEllerSenere(fom)) {
            return feil(
                felt,
                'Du kan ikke legge inn fra og med dato som er neste måned eller senere'
            );
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
