import { useState } from 'react';

import type { FieldDictionary, ISkjema } from '@navikt/familie-skjema';
import { useSkjema } from '@navikt/familie-skjema';

import type { IBehandling } from '../../../../typer/behandling';
import type { IGrunnlagPerson } from '../../../../typer/person';
import type { Begrunnelse } from '../../../../typer/vedtak';
import type { IEndreVilkårResultat, Regelverk } from '../../../../typer/vilkår';
import type { Resultat, UtdypendeVilkårsvurdering } from '../../../../typer/vilkår';
import type { IVilkårResultat } from '../../../../typer/vilkår';
import type { IIsoDatoPeriode } from '../../../../utils/dato';
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
}

export interface VilkårSkjemaContextValue<T extends IVilkårSkjemaContext> {
    skjema: ISkjema<T, IBehandling>;
    lagreVilkår: () => void;
    lagrerVilkår: boolean;
    slettVilkår: (personIdent: string, vilkårId: number) => void;
    sletterVilkår: boolean;
    feilmelding: string;
}

export const useVilkårSkjema = <T extends IVilkårSkjemaContext>(
    vilkår: IVilkårResultat,
    felter: FieldDictionary<T>,
    person: IGrunnlagPerson,
    toggleForm: (visSkjema: boolean) => void
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

    const lagreVilkår = () => {
        if (kanSendeSkjema()) {
            settVisfeilmeldinger(false);
            const endreVilkårResultat: IEndreVilkårResultat = {
                personIdent: person.personIdent,
                endretVilkårResultat: {
                    begrunnelse: skjema.felter.begrunnelse.verdi,
                    behandlingId: vilkår.behandlingId,
                    endretAv: vilkår.endretAv,
                    endretTidspunkt: vilkår.endretTidspunkt,
                    erAutomatiskVurdert: vilkår.erAutomatiskVurdert,
                    erVurdert: vilkår.erVurdert,
                    id: vilkår.id,
                    periodeFom: skjema.felter.periode.verdi.fom,
                    periodeTom: skjema.felter.periode.verdi.tom,
                    resultat: skjema.felter.resultat.verdi,
                    erEksplisittAvslagPåSøknad: skjema.felter.erEksplisittAvslagPåSøknad.verdi,
                    avslagBegrunnelser: skjema.felter.avslagBegrunnelser.verdi,
                    vilkårType: vilkår.vilkårType,
                    vurderesEtter: skjema.felter.vurderesEtter.verdi,
                    utdypendeVilkårsvurderinger: skjema.felter.utdypendeVilkårsvurdering.verdi,
                    antallTimer: skjema.felter.antallTimer
                        ? skjema.felter.antallTimer.verdi !== ''
                            ? Number(skjema.felter.antallTimer.verdi)
                            : undefined
                        : undefined,
                },
            };
            vilkårsvurderingApi.lagreVilkår(
                endreVilkårResultat,
                () => {
                    toggleForm(false);
                    nullstillSkjema();
                },
                lagreVilkårFeilmelding => settFeilmelding(lagreVilkårFeilmelding)
            );
        }
    };

    const slettVilkår = (personIdent: string, vilkårId: number) => {
        settVisfeilmeldinger(false);
        vilkårsvurderingApi.slettVilkår(
            personIdent,
            vilkårId,
            () => {
                toggleForm(false);
                nullstillSkjema();
            },
            slettVilkårFeilmelding => settFeilmelding(slettVilkårFeilmelding)
        );
    };

    return {
        skjema,
        lagreVilkår,
        lagrerVilkår: vilkårsvurderingApi.lagrerVilkår,
        slettVilkår,
        sletterVilkår: vilkårsvurderingApi.sletterVilkår,
        feilmelding,
    };
};
