import { useState } from 'react';

import { useFelt } from '@navikt/familie-skjema';

import { erUtdypendeVilkårsvurderingerGyldig } from './BorMedSøkerValidering';
import type { IGrunnlagPerson } from '../../../../../../typer/person';
import type { Begrunnelse } from '../../../../../../typer/vedtak';
import type { UtdypendeVilkårsvurdering } from '../../../../../../typer/vilkår';
import type { IVilkårResultat } from '../../../../../../typer/vilkår';
import type { Resultat } from '../../../../../../typer/vilkår';
import { Regelverk as RegelverkType, VilkårType } from '../../../../../../typer/vilkår';
import {
    UtdypendeVilkårsvurderingDeltBosted,
    UtdypendeVilkårsvurderingEøsBarnBorMedSøker,
    UtdypendeVilkårsvurderingGenerell,
} from '../../../../../../typer/vilkår';
import type { IIsoDatoPeriode } from '../../../../../../utils/dato';
import {
    erAvslagBegrunnelserGyldig,
    erPeriodeGyldig,
    erResultatGyldig,
    erBegrunnelseGyldig,
} from '../../../../../../utils/validators';
import { useVilkårSkjema, type IVilkårSkjemaContext } from '../../VilkårSkjemaContext';

export const useBorMedSøker = (lagretVilkår: IVilkårResultat, person: IGrunnlagPerson) => {
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
        avhengigheter: {
            vurderesEtter: vurderesEtter.verdi,
        },
        valideringsfunksjon: erUtdypendeVilkårsvurderingerGyldig,
    });

    const felter = {
        vurderesEtter,
        resultat,
        utdypendeVilkårsvurdering,
        periode: useFelt<IIsoDatoPeriode>({
            verdi: vilkårSkjemaMedLagredeVerdier.periode,
            avhengigheter: {
                person,
                erEksplisittAvslagPåSøknad: erEksplisittAvslagPåSøknad.verdi,
            },
            valideringsfunksjon: (felt, avhengigheter) =>
                erPeriodeGyldig(felt, VilkårType.BOR_MED_SØKER, avhengigheter),
        }),
        begrunnelse: useFelt<string>({
            verdi: vilkårSkjemaMedLagredeVerdier.begrunnelse,
            valideringsfunksjon: erBegrunnelseGyldig,
            avhengigheter: {
                vurderesEtter: vurderesEtter.verdi,
                utdypendeVilkårsvurderinger: utdypendeVilkårsvurdering.verdi,
                personType: person.type,
                vilkårType: lagretVilkår.vilkårType,
            },
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

    const initielleMuligeUtdypendeVilkårsvurderinger =
        bestemMuligeUtdypendeVilkårsvurderingerIBorMedSøkerVilkår(
            vilkårSkjemaMedLagredeVerdier.vurderesEtter
        );

    const [muligeUtdypendeVilkårsvurderinger, settMuligeUtdypendeVilkårsvurderinger] = useState<
        UtdypendeVilkårsvurdering[]
    >(initielleMuligeUtdypendeVilkårsvurderinger);

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
            nullstillSkjema: () => {
                nullstillSkjema();
                settMuligeUtdypendeVilkårsvurderinger(initielleMuligeUtdypendeVilkårsvurderinger);
            },
        },
        finnesEndringerSomIkkeErLagret: () =>
            finnesEndringerSomIkkeErLagret(vilkårSkjemaMedLagredeVerdier),
        muligeUtdypendeVilkårsvurderinger,
        settMuligeUtdypendeVilkårsvurderinger,
    };
};

export const bestemMuligeUtdypendeVilkårsvurderingerIBorMedSøkerVilkår = (
    vurderesEtter: RegelverkType | undefined
): UtdypendeVilkårsvurdering[] => {
    if (vurderesEtter === RegelverkType.EØS_FORORDNINGEN) {
        return [
            UtdypendeVilkårsvurderingEøsBarnBorMedSøker.BARN_BOR_I_EØS_MED_SØKER,
            UtdypendeVilkårsvurderingEøsBarnBorMedSøker.BARN_BOR_I_EØS_MED_ANNEN_FORELDER,
            UtdypendeVilkårsvurderingEøsBarnBorMedSøker.BARN_BOR_ALENE_I_ANNET_EØS_LAND,
            UtdypendeVilkårsvurderingEøsBarnBorMedSøker.BARN_BOR_I_NORGE_MED_SØKER,
            UtdypendeVilkårsvurderingEøsBarnBorMedSøker.BARN_BOR_I_STORBRITANNIA_MED_SØKER,
            UtdypendeVilkårsvurderingEøsBarnBorMedSøker.BARN_BOR_I_STORBRITANNIA_MED_ANNEN_FORELDER,
            UtdypendeVilkårsvurderingDeltBosted.DELT_BOSTED,
            UtdypendeVilkårsvurderingDeltBosted.DELT_BOSTED_SKAL_IKKE_DELES,
            UtdypendeVilkårsvurderingGenerell.VURDERING_ANNET_GRUNNLAG,
        ];
    }
    return [
        UtdypendeVilkårsvurderingGenerell.VURDERING_ANNET_GRUNNLAG,
        UtdypendeVilkårsvurderingDeltBosted.DELT_BOSTED,
        UtdypendeVilkårsvurderingDeltBosted.DELT_BOSTED_SKAL_IKKE_DELES,
    ];
};
