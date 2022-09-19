import type { FieldDictionary } from '@navikt/familie-skjema';
import { useSkjema } from '@navikt/familie-skjema';

import type { IBehandling } from '../../../../typer/behandling';
import type { IGrunnlagPerson } from '../../../../typer/person';
import type { VedtakBegrunnelse } from '../../../../typer/vedtak';
import type { IRestPersonResultat, Regelverk } from '../../../../typer/vilkår';
import type { Resultat, UtdypendeVilkårsvurdering } from '../../../../typer/vilkår';
import type { IVilkårResultat } from '../../../../typer/vilkår';
import type { IPeriode } from '../../../../utils/kalender';
import { useVilkårsvurderingApi } from '../useVilkårsvurderingApi';

export interface IVilkårSkjemaContext {
    vurderesEtter: Regelverk | undefined;
    resultat: Resultat;
    utdypendeVilkårsvurdering: UtdypendeVilkårsvurdering[];
    periode: IPeriode;
    begrunnelse: string;
    erEksplisittAvslagPåSøknad: boolean;
    avslagBegrunnelser: VedtakBegrunnelse[];
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

    const lagreVilkår = () => {
        if (kanSendeSkjema()) {
            settVisfeilmeldinger(false);
            const restPersonResultat: IRestPersonResultat = {
                personIdent: person.personIdent,
                vilkårResultater: [
                    {
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
                    },
                ],
                andreVurderinger: [],
            };
            vilkårsvurderingApi.lagreVilkår(restPersonResultat, vilkår.id, () => {
                toggleForm(false);
                nullstillSkjema();
            });
        }
    };

    const slettVilkår = (personIdent: string, vilkårId: number) => {
        vilkårsvurderingApi.slettVilkår(personIdent, vilkårId, () => {
            toggleForm(false);
            nullstillSkjema();
        });
    };

    return {
        skjema,
        lagreVilkår,
        lagrerVilkår: vilkårsvurderingApi.lagrerVilkår,
        slettVilkår,
        sletterVilkår: vilkårsvurderingApi.sletterVilkår,
    };
};
