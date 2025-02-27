import { useFelt } from '@navikt/familie-skjema';

import { erUtdypendeVilkårsvurderingerGyldig } from './BosattIRiketValidering';
import { PersonType } from '../../../../../../typer/person';
import type { IGrunnlagPerson } from '../../../../../../typer/person';
import type { Begrunnelse } from '../../../../../../typer/vedtak';
import type { UtdypendeVilkårsvurdering } from '../../../../../../typer/vilkår';
import type { IVilkårResultat } from '../../../../../../typer/vilkår';
import type { Resultat } from '../../../../../../typer/vilkår';
import { Regelverk as RegelverkType, VilkårType } from '../../../../../../typer/vilkår';
import {
    UtdypendeVilkårsvurderingGenerell,
    UtdypendeVilkårsvurderingEøsSøkerBosattIRiket,
    UtdypendeVilkårsvurderingEøsBarnBosattIRiket,
} from '../../../../../../typer/vilkår';
import type { IIsoDatoPeriode } from '../../../../../../utils/dato';
import {
    erAvslagBegrunnelserGyldig,
    erPeriodeGyldig,
    erResultatGyldig,
    erBegrunnelseGyldig,
} from '../../../../../../utils/validators';
import { useVilkårSkjema, type IVilkårSkjemaContext } from '../../VilkårSkjemaContext';

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
            vurderesEtter: vurderesEtter.verdi,
            person: person,
        },
        valideringsfunksjon: erUtdypendeVilkårsvurderingerGyldig,
    });

    const felter = {
        vurderesEtter,
        resultat,
        utdypendeVilkårsvurdering,
        periode: useFelt<IIsoDatoPeriode>({
            verdi: vilkårSkjema.periode,
            avhengigheter: {
                person,
                erEksplisittAvslagPåSøknad: erEksplisittAvslagPåSøknad.verdi,
            },
            valideringsfunksjon: (felt, avhengigheter) =>
                erPeriodeGyldig(felt, VilkårType.BOSATT_I_RIKET, avhengigheter),
        }),
        begrunnelse: useFelt<string>({
            verdi: vilkårSkjema.begrunnelse,
            valideringsfunksjon: erBegrunnelseGyldig,
            avhengigheter: {
                vurderesEtter: vurderesEtter.verdi,
                utdypendeVilkårsvurderinger: utdypendeVilkårsvurdering.verdi,
                personType: person.type,
                vilkårType: vilkår.vilkårType,
            },
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

    const {
        skjema,
        lagreVilkår,
        lagrerVilkår,
        slettVilkår,
        sletterVilkår,
        feilmelding,
        nullstillSkjema,
        finnesEndringerSomIkkeErLagret,
    } = useVilkårSkjema(vilkår, felter, person);

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
        finnesEndringerSomIkkeErLagret,
    };
};

export const bestemMuligeUtdypendeVilkårsvurderingerIBosattIRiketVilkår = (
    vurderesEtter: RegelverkType | undefined,
    person: IGrunnlagPerson
): UtdypendeVilkårsvurdering[] => {
    if (vurderesEtter === RegelverkType.EØS_FORORDNINGEN) {
        if (person.type === PersonType.SØKER) {
            return [
                UtdypendeVilkårsvurderingEøsSøkerBosattIRiket.OMFATTET_AV_NORSK_LOVGIVNING,
                UtdypendeVilkårsvurderingEøsSøkerBosattIRiket.OMFATTET_AV_NORSK_LOVGIVNING_UTLAND,
                UtdypendeVilkårsvurderingEøsSøkerBosattIRiket.ANNEN_FORELDER_OMFATTET_AV_NORSK_LOVGIVNING,
            ];
        } else if (person.type === PersonType.BARN) {
            return [
                UtdypendeVilkårsvurderingEøsBarnBosattIRiket.BARN_BOR_I_EØS,
                UtdypendeVilkårsvurderingEøsBarnBosattIRiket.BARN_BOR_I_NORGE,
                UtdypendeVilkårsvurderingEøsBarnBosattIRiket.BARN_BOR_I_STORBRITANNIA,
            ];
        }
    }
    return [UtdypendeVilkårsvurderingGenerell.VURDERING_ANNET_GRUNNLAG];
};
