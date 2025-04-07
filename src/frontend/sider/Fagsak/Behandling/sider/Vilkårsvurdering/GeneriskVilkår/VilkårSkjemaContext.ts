import { useState } from 'react';

import deepEqual from 'deep-equal';

import type { FieldDictionary, ISkjema } from '@navikt/familie-skjema';
import { useSkjema } from '@navikt/familie-skjema';

import type { IBehandling } from '../../../../../../typer/behandling';
import type { IGrunnlagPerson } from '../../../../../../typer/person';
import type { Begrunnelse } from '../../../../../../typer/vedtak';
import type { IEndreVilkårResultat, Regelverk } from '../../../../../../typer/vilkår';
import type { Resultat, UtdypendeVilkårsvurdering } from '../../../../../../typer/vilkår';
import type { IVilkårResultat } from '../../../../../../typer/vilkår';
import {
    dateTilIsoDatoStringEllerUndefined,
    type IIsoDatoPeriode,
} from '../../../../../../utils/dato';
import { useVilkårsvurderingApi } from '../useVilkårsvurderingApi';

export interface IVilkårSkjemaContext {
    vurderesEtter: Regelverk | undefined;
    resultat: Resultat;
    utdypendeVilkårsvurdering: UtdypendeVilkårsvurdering[];
    periode: IIsoDatoPeriode;
    begrunnelse: string;
    erEksplisittAvslagPåSøknad: boolean;
    avslagBegrunnelser: Begrunnelse[];
    antallTimer?: string;
    søkerHarMeldtFraOmBarnehageplass?: boolean;
    adopsjonsdato?: Date;
}

export interface VilkårSkjemaContextValue<T extends IVilkårSkjemaContext> {
    skjema: ISkjema<T, IBehandling>;
    lagreVilkår: (onSuccess?: () => void) => void;
    lagrerVilkår: boolean;
    slettVilkår: (personIdent: string, vilkårId: number, onSuccess?: () => void) => void;
    sletterVilkår: boolean;
    feilmelding: string;
    nullstillSkjema: () => void;
}

export const useVilkårSkjema = <T extends IVilkårSkjemaContext>(
    vilkår: IVilkårResultat,
    felter: FieldDictionary<T>,
    person: IGrunnlagPerson
) => {
    const vilkårsvurderingApi = useVilkårsvurderingApi();

    const { skjema, kanSendeSkjema, settVisfeilmeldinger, nullstillSkjema } = useSkjema<
        T,
        IBehandling
    >({
        felter,
        skjemanavn: 'Vilkårskjema',
    });

    const [feilmelding, settFeilmelding] = useState<string>('');

    const mapSkjemaTilVilkårSkjemaContext = (): IVilkårSkjemaContext => {
        return {
            vurderesEtter: skjema.felter.vurderesEtter.verdi,
            resultat: skjema.felter.resultat.verdi,
            utdypendeVilkårsvurdering: skjema.felter.utdypendeVilkårsvurdering.verdi,
            periode: skjema.felter.periode.verdi,
            begrunnelse: skjema.felter.begrunnelse.verdi,
            erEksplisittAvslagPåSøknad: skjema.felter.erEksplisittAvslagPåSøknad.verdi,
            avslagBegrunnelser: skjema.felter.avslagBegrunnelser.verdi,
            antallTimer: skjema.felter.antallTimer?.verdi,
            søkerHarMeldtFraOmBarnehageplass: skjema.felter.søkerHarMeldtFraOmBarnehageplass?.verdi,
            adopsjonsdato: skjema.felter.adopsjonsdato?.verdi,
        };
    };

    const mapSkjemaTilIEndreVilkårResultat = (): IEndreVilkårResultat => {
        const skjemaContext = mapSkjemaTilVilkårSkjemaContext();
        return {
            personIdent: person.personIdent,
            adopsjonsdato: dateTilIsoDatoStringEllerUndefined(skjemaContext.adopsjonsdato),
            endretVilkårResultat: {
                begrunnelse: skjemaContext.begrunnelse,
                behandlingId: vilkår.behandlingId,
                endretAv: vilkår.endretAv,
                endretTidspunkt: vilkår.endretTidspunkt,
                erAutomatiskVurdert: vilkår.erAutomatiskVurdert,
                erVurdert: vilkår.erVurdert,
                id: vilkår.id,
                periodeFom: skjemaContext.periode.fom,
                periodeTom: skjemaContext.periode.tom,
                resultat: skjemaContext.resultat,
                erEksplisittAvslagPåSøknad: skjemaContext.erEksplisittAvslagPåSøknad,
                avslagBegrunnelser: skjemaContext.avslagBegrunnelser,
                vilkårType: vilkår.vilkårType,
                vurderesEtter: skjemaContext.vurderesEtter,
                utdypendeVilkårsvurderinger: skjemaContext.utdypendeVilkårsvurdering,
                antallTimer:
                    skjemaContext.antallTimer && skjemaContext.antallTimer !== ''
                        ? Number(skjemaContext.antallTimer)
                        : undefined,
                søkerHarMeldtFraOmBarnehageplass:
                    skjemaContext.søkerHarMeldtFraOmBarnehageplass ?? undefined,
            },
        };
    };

    const lagreVilkår = (onSuccess?: () => void) => {
        if (kanSendeSkjema()) {
            settVisfeilmeldinger(false);
            const endreVilkårResultat: IEndreVilkårResultat = mapSkjemaTilIEndreVilkårResultat();
            vilkårsvurderingApi.lagreVilkår(
                endreVilkårResultat,
                onSuccess,
                lagreVilkårFeilmelding => settFeilmelding(lagreVilkårFeilmelding)
            );
        }
    };

    const slettVilkår = (personIdent: string, vilkårId: number, onSuccess?: () => void) => {
        settVisfeilmeldinger(false);
        vilkårsvurderingApi.slettVilkår(personIdent, vilkårId, onSuccess, slettVilkårFeilmelding =>
            settFeilmelding(slettVilkårFeilmelding)
        );
    };

    const finnesEndringerSomIkkeErLagret = (
        vilkårSkjemaMedLagredeVerdier: IVilkårSkjemaContext
    ) => {
        const endretVilkår: IVilkårSkjemaContext = mapSkjemaTilVilkårSkjemaContext();

        // Sjekker på likhet uten felter som er undefined for å ikke få true hvis det ene objektet har felt=undefined og den andre mangler feltet
        const lagretVilkårUtenUndefined = Object.fromEntries(
            Object.entries(vilkårSkjemaMedLagredeVerdier).filter(([_, v]) => v !== undefined)
        ) as IVilkårSkjemaContext;

        const endretVilkårUtenUndefined = Object.fromEntries(
            Object.entries(endretVilkår).filter(([_, v]) => v !== undefined)
        ) as IVilkårSkjemaContext;

        return !deepEqual(lagretVilkårUtenUndefined, endretVilkårUtenUndefined);
    };

    return {
        skjema,
        lagreVilkår,
        lagrerVilkår: vilkårsvurderingApi.lagrerVilkår,
        slettVilkår,
        sletterVilkår: vilkårsvurderingApi.sletterVilkår,
        feilmelding,
        nullstillSkjema,
        finnesEndringerSomIkkeErLagret,
    };
};
