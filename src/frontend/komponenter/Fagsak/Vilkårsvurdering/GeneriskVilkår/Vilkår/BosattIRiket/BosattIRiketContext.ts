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
import {
    erAvslagBegrunnelserGyldig,
    erPeriodeGyldig,
    erResultatGyldig,
} from '../../../../../../utils/validators';
import type { IVilkårSkjemaContext } from '../../VilkårSkjemaContext';
import { erBegrunnelseGyldig, erUtdypendeVilkårsvurderingerGyldig } from './BosattIRiketValidering';

export const useBosattIRiket = (vilkår: IVilkårResultat, person: IGrunnlagPerson) => {
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
        avhengigheter: {
            personType: person.type,
            vurderesEtter: vurderesEtter.verdi,
            resultat: resultat.verdi,
            vilkårType: vilkår.vilkårType,
        },
        valideringsfunksjon: erUtdypendeVilkårsvurderingerGyldig,
    });

    const felter = {
        vurderesEtter,
        resultat,
        utdypendeVilkårsvurdering,
        periode: useFelt<IYearMonthPeriode>({
            verdi: vilkårSkjema.periode,
            avhengigheter: {
                person,
                erEksplisittAvslagPåSøknad: erEksplisittAvslagPåSøknad.verdi,
                erMellom1Og2EllerAdoptertVilkår: false,
            },
            valideringsfunksjon: erPeriodeGyldig,
        }),
        begrunnelse: useFelt<string>({
            verdi: vilkårSkjema.begrunnelse,
            valideringsfunksjon: erBegrunnelseGyldig,
            avhengigheter: {
                vurderesEtter: vurderesEtter.verdi,
                utdypendeVilkårsvurdering: utdypendeVilkårsvurdering.verdi,
            },
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
