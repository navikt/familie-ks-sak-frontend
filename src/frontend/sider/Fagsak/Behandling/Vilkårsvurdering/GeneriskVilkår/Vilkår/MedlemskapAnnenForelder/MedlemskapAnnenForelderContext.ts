import { useFelt } from '@navikt/familie-skjema';

import { erPeriodeGyldig } from './MedlemskapAnnenForelderValidering';
import type { IGrunnlagPerson } from '../../../../../../../typer/person';
import type { Begrunnelse } from '../../../../../../../typer/vedtak';
import type { IVilkårResultat } from '../../../../../../../typer/vilkår';
import type {
    Regelverk as RegelverkType,
    Resultat,
    UtdypendeVilkårsvurdering,
} from '../../../../../../../typer/vilkår';
import type { IIsoDatoPeriode } from '../../../../../../../utils/dato';
import {
    erAvslagBegrunnelserGyldig,
    erResultatGyldig,
} from '../../../../../../../utils/validators';
import { useVilkårSkjema, type IVilkårSkjemaContext } from '../../VilkårSkjemaContext';

export const useMedlemskapAnnenForelder = (
    lagretVilkår: IVilkårResultat,
    person: IGrunnlagPerson
) => {
    const vilkårSkjemaMedLagredeVerdier: IVilkårSkjemaContext = {
        vurderesEtter: lagretVilkår.vurderesEtter ?? undefined,
        resultat: lagretVilkår.resultat,
        utdypendeVilkårsvurdering: lagretVilkår.utdypendeVilkårsvurderinger,
        periode: lagretVilkår.periode,
        begrunnelse: lagretVilkår.begrunnelse,
        erEksplisittAvslagPåSøknad: lagretVilkår.erEksplisittAvslagPåSøknad ?? false,
        avslagBegrunnelser: lagretVilkår.avslagBegrunnelser,
    };

    const vurderesEtter = useFelt<RegelverkType | undefined>({
        verdi: vilkårSkjemaMedLagredeVerdier.vurderesEtter,
    });

    const resultat = useFelt<Resultat>({
        verdi: vilkårSkjemaMedLagredeVerdier.resultat,
        valideringsfunksjon: erResultatGyldig,
    });

    const erEksplisittAvslagPåSøknad = useFelt<boolean>({
        verdi: vilkårSkjemaMedLagredeVerdier.erEksplisittAvslagPåSøknad,
    });

    const utdypendeVilkårsvurdering = useFelt<UtdypendeVilkårsvurdering[]>({
        verdi: vilkårSkjemaMedLagredeVerdier.utdypendeVilkårsvurdering,
    });

    const felter = {
        vurderesEtter,
        resultat,
        utdypendeVilkårsvurdering,
        periode: useFelt<IIsoDatoPeriode>({
            verdi: vilkårSkjemaMedLagredeVerdier.periode,
            avhengigheter: {
                person,
                resultat,
                erEksplisittAvslagPåSøknad: erEksplisittAvslagPåSøknad.verdi,
                erMedlemskapAnnenForelderVilkår: true,
            },
            valideringsfunksjon: (felt, avhengigheter) => erPeriodeGyldig(felt, avhengigheter),
        }),
        begrunnelse: useFelt<string>({
            verdi: vilkårSkjemaMedLagredeVerdier.begrunnelse,
        }),
        erEksplisittAvslagPåSøknad,
        avslagBegrunnelser: useFelt<Begrunnelse[]>({
            verdi: vilkårSkjemaMedLagredeVerdier.avslagBegrunnelser,
            valideringsfunksjon: erAvslagBegrunnelserGyldig,
            avhengigheter: {
                erEksplisittAvslagPåSøknad: erEksplisittAvslagPåSøknad.verdi,
            },
        }),
    };

    const {
        skjema,
        lagreVilkår,
        lagrerVilkår,
        slettVilkår,
        sletterVilkår,
        feilmelding,
        nullstillSkjema,
        finnesEndringerSomIkkeErLagret,
    } = useVilkårSkjema(lagretVilkår, felter, person);

    return {
        vilkårSkjemaContext: {
            skjema,
            lagreVilkår,
            lagrerVilkår,
            slettVilkår,
            sletterVilkår,
            feilmelding,
            nullstillSkjema,
        },
        finnesEndringerSomIkkeErLagret: () =>
            finnesEndringerSomIkkeErLagret(vilkårSkjemaMedLagredeVerdier),
    };
};
