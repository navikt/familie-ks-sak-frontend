import { useFelt } from '@navikt/familie-skjema';

import { erPeriodeGyldig } from './MedlemskapAnnenForelderValidering';
import { useApp } from '../../../../../../context/AppContext';
import type { IGrunnlagPerson } from '../../../../../../typer/person';
import { ToggleNavn } from '../../../../../../typer/toggles';
import type { Begrunnelse } from '../../../../../../typer/vedtak';
import type { IVilkårResultat } from '../../../../../../typer/vilkår';
import type {
    Regelverk as RegelverkType,
    Resultat,
    UtdypendeVilkårsvurdering,
} from '../../../../../../typer/vilkår';
import type { IIsoDatoPeriode } from '../../../../../../utils/dato';
import { erAvslagBegrunnelserGyldig, erResultatGyldig } from '../../../../../../utils/validators';
import type { IVilkårSkjemaContext } from '../../VilkårSkjemaContext';

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

    const { toggles } = useApp();
    const erLovendringTogglePå = toggles[ToggleNavn.lovEndring7mndNyeBehandlinger];

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
        periode: useFelt<IIsoDatoPeriode>({
            verdi: vilkårSkjema.periode,
            avhengigheter: {
                person,
                resultat,
                erEksplisittAvslagPåSøknad: erEksplisittAvslagPåSøknad.verdi,
                erMedlemskapAnnenForelderVilkår: true,
            },
            valideringsfunksjon: (felt, avhengigheter) =>
                erPeriodeGyldig(felt, erLovendringTogglePå, avhengigheter),
        }),
        begrunnelse: useFelt<string>({
            verdi: vilkårSkjema.begrunnelse,
        }),
        erEksplisittAvslagPåSøknad,
        avslagBegrunnelser: useFelt<Begrunnelse[]>({
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
