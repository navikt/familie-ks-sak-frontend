import { useState } from 'react';

import { useFelt } from '@navikt/familie-skjema';

import { erUtdypendeVilkårsvurderingerGyldig } from './BosattIRiketValidering';
import type { IGrunnlagPerson } from '../../../../../../../../typer/person';
import { PersonType } from '../../../../../../../../typer/person';
import type { Begrunnelse } from '../../../../../../../../typer/vedtak';
import type { IVilkårResultat, Resultat } from '../../../../../../../../typer/vilkår';
import {
    Regelverk as RegelverkType,
    type UtdypendeVilkårsvurdering,
    UtdypendeVilkårsvurderingEøsBarnBosattIRiket,
    UtdypendeVilkårsvurderingEøsSøkerBosattIRiket,
    UtdypendeVilkårsvurderingGenerell,
    VilkårType,
} from '../../../../../../../../typer/vilkår';
import type { IIsoDatoPeriode } from '../../../../../../../../utils/dato';
import {
    erAvslagBegrunnelserGyldig,
    erBegrunnelseGyldig,
    erPeriodeGyldig,
    erResultatGyldig,
} from '../../../../../../../../utils/validators';
import { type IVilkårSkjemaContext, useVilkårSkjema } from '../../VilkårSkjemaContext';

export const useBosattIRiket = (lagretVilkår: IVilkårResultat, person: IGrunnlagPerson) => {
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
            person: person,
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
                erPeriodeGyldig(felt, VilkårType.BOSATT_I_RIKET, avhengigheter),
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

    const initielleMuligeUtdypendeVilkårsvurderinger = bestemMuligeUtdypendeVilkårsvurderingerIBosattIRiketVilkår(
        vilkårSkjemaMedLagredeVerdier.vurderesEtter,
        person
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
        finnesEndringerSomIkkeErLagret: () => finnesEndringerSomIkkeErLagret(vilkårSkjemaMedLagredeVerdier),
        muligeUtdypendeVilkårsvurderinger,
        settMuligeUtdypendeVilkårsvurderinger,
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
    return [
        UtdypendeVilkårsvurderingGenerell.VURDERING_ANNET_GRUNNLAG,
        UtdypendeVilkårsvurderingGenerell.BOSATT_PÅ_SVALBARD,
    ];
};
