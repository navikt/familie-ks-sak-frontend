import { useFelt } from '@navikt/familie-skjema';

import type { IGrunnlagPerson } from '../../../../../../typer/person';
import type { VedtakBegrunnelse } from '../../../../../../typer/vedtak';
import type { IVilkårResultat } from '../../../../../../typer/vilkår';
import type {
    Regelverk as RegelverkType,
    Resultat,
    UtdypendeVilkårsvurdering,
} from '../../../../../../typer/vilkår';
import type { IYearMonthPeriode } from '../../../../../../utils/kalender';
import { erAvslagBegrunnelserGyldig, erResultatGyldig } from '../../../../../../utils/validators';
import type { IVilkårSkjemaContext } from '../../VilkårSkjemaContext';
import { erPeriodeGyldig } from './MedlemskapAnnenForelderValidering';

export const useMedlemskapAnnenForelder = (vilkår: IVilkårResultat, person: IGrunnlagPerson) => {
    const vilkårSkjema: IVilkårSkjemaContext = {
        vurderesEtter: vilkår.vurderesEtter ? vilkår.vurderesEtter : undefined,
        resultat: vilkår.resultat,
        utdypendeVilkårsvurdering: vilkår.utdypendeVilkårsvurderinger,
        periode: vilkår.periode,
        begrunnelse: vilkår.begrunnelse,
        erEksplisittAvslagPåSøknad: vilkår.erEksplisittAvslagPåSøknad ?? false,
        avslagBegrunnelser: vilkår.avslagBegrunnelser,
    };

    const vurderesEtter = useFelt<RegelverkType | undefined>({
        verdi: vilkårSkjema.vurderesEtter,
    });

    const resultat = useFelt<Resultat>({
        verdi: vilkårSkjema.resultat,
        valideringsfunksjon: erResultatGyldig,
    });

    const erEksplisittAvslagPåSøknad = useFelt<boolean>({
        verdi: vilkårSkjema.erEksplisittAvslagPåSøknad,
    });

    const utdypendeVilkårsvurdering = useFelt<UtdypendeVilkårsvurdering[]>({
        verdi: vilkårSkjema.utdypendeVilkårsvurdering,
    });

    const felter = {
        vurderesEtter,
        resultat,
        utdypendeVilkårsvurdering,
        periode: useFelt<IYearMonthPeriode>({
            verdi: vilkårSkjema.periode,
            avhengigheter: {
                person,
                resultat,
                erEksplisittAvslagPåSøknad: erEksplisittAvslagPåSøknad.verdi,
                erMedlemskapAnnenForelderVilkår: true,
            },
            valideringsfunksjon: erPeriodeGyldig,
        }),
        begrunnelse: useFelt<string>({
            verdi: vilkårSkjema.begrunnelse,
        }),
        erEksplisittAvslagPåSøknad,
        avslagBegrunnelser: useFelt<VedtakBegrunnelse[]>({
            verdi: vilkårSkjema.avslagBegrunnelser,
            valideringsfunksjon: erAvslagBegrunnelserGyldig,
            avhengigheter: {
                erEksplisittAvslagPåSøknad: erEksplisittAvslagPåSøknad.verdi,
            },
        }),
    };

    return {
        felter,
    };
};
