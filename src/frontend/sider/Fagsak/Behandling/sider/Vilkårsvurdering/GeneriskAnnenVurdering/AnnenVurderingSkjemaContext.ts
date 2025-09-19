import { useSkjema, useFelt } from '@navikt/familie-skjema';

import type { IBehandling } from '../../../../../../typer/behandling';
import type { IAnnenVurdering, IRestAnnenVurdering, Resultat } from '../../../../../../typer/vilkår';
import { useVilkårsvurderingApi } from '../useVilkårsvurderingApi';

interface IAnnenVurderingSkjema {
    resultat: Resultat;
    begrunnelse: string;
}

export const useAnnenVurderingSkjema = (annenVurdering: IAnnenVurdering, toggleForm: (visSkjema: boolean) => void) => {
    const vilkårsvurderingApi = useVilkårsvurderingApi();

    const { skjema, kanSendeSkjema, settVisfeilmeldinger, nullstillSkjema } = useSkjema<
        IAnnenVurderingSkjema,
        IBehandling
    >({
        felter: {
            resultat: useFelt<Resultat>({
                verdi: annenVurdering.resultat,
            }),
            begrunnelse: useFelt<string>({
                verdi: annenVurdering.begrunnelse,
            }),
        },
        skjemanavn: 'Annen vurdering skjema',
    });

    const lagreAnnenVurdering = () => {
        if (kanSendeSkjema()) {
            settVisfeilmeldinger(false);
            const restAnnenVurdering: IRestAnnenVurdering = {
                id: annenVurdering.id,
                resultat: skjema.felter.resultat.verdi,
                begrunnelse: skjema.felter.begrunnelse.verdi,
                behandlingId: annenVurdering.behandlingId,
                endretAv: annenVurdering.endretAv,
                endretTidspunkt: annenVurdering.endretTidspunkt,
                erVurdert: annenVurdering.erVurdert,
                type: annenVurdering.type,
            };
            vilkårsvurderingApi.lagreAnnenVurdering(restAnnenVurdering, () => {
                toggleForm(false);
                nullstillSkjema();
            });
        }
    };

    return {
        skjema,
        lagreAnnenVurdering,
        lagrerAnnenVurdering: vilkårsvurderingApi.lagrerAnnenVurdering,
        lagreAnnenVurderingFeilmelding: vilkårsvurderingApi.lagreAnnenVurderingFeilmelding,
    };
};
