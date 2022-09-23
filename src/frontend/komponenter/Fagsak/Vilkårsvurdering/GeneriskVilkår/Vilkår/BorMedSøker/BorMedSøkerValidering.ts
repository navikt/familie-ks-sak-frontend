import type { Avhengigheter, FeltState } from '@navikt/familie-skjema';
import { feil, ok } from '@navikt/familie-skjema';

import type { UtdypendeVilkårsvurdering } from '../../../../../../typer/vilkår';
import {
    Regelverk,
    Resultat,
    UtdypendeVilkårsvurderingDeltBosted,
    UtdypendeVilkårsvurderingEøsBarnBorMedSøker,
    UtdypendeVilkårsvurderingGenerell,
} from '../../../../../../typer/vilkår';

export const bestemMuligeUtdypendeVilkårsvurderinger = (
    regelverk: Regelverk,
    resultat: Resultat
) => {
    if (regelverk === Regelverk.EØS_FORORDNINGEN) {
        if (resultat === Resultat.IKKE_OPPFYLT) {
            return [];
        }
        return [
            UtdypendeVilkårsvurderingEøsBarnBorMedSøker.BARN_BOR_I_EØS_MED_SØKER,
            UtdypendeVilkårsvurderingEøsBarnBorMedSøker.BARN_BOR_I_EØS_MED_ANNEN_FORELDER,
            UtdypendeVilkårsvurderingEøsBarnBorMedSøker.BARN_BOR_I_NORGE_MED_SØKER,
            UtdypendeVilkårsvurderingEøsBarnBorMedSøker.BARN_BOR_I_STORBRITANNIA_MED_SØKER,
            UtdypendeVilkårsvurderingEøsBarnBorMedSøker.BARN_BOR_I_STORBRITANNIA_MED_ANNEN_FORELDER,
            UtdypendeVilkårsvurderingEøsBarnBorMedSøker.BARN_BOR_ALENE_I_ANNET_EØS_LAND,
            UtdypendeVilkårsvurderingDeltBosted.DELT_BOSTED,
            UtdypendeVilkårsvurderingDeltBosted.DELT_BOSTED_SKAL_IKKE_DELES,
            UtdypendeVilkårsvurderingGenerell.VURDERING_ANNET_GRUNNLAG,
        ];
    }
    return [
        UtdypendeVilkårsvurderingGenerell.VURDERING_ANNET_GRUNNLAG,
        UtdypendeVilkårsvurderingDeltBosted.DELT_BOSTED_SKAL_IKKE_DELES,
        UtdypendeVilkårsvurderingDeltBosted.DELT_BOSTED,
    ];
};

export const erUtdypendeVilkårsvurderingerGyldig = (
    felt: FeltState<UtdypendeVilkårsvurdering[]>,
    avhengigheter?: Avhengigheter
): FeltState<UtdypendeVilkårsvurdering[]> => {
    if (!avhengigheter) {
        return feil(felt, 'Utdypende vilkårsvurdering er ugyldig');
    }
    const muligeUtdypendeVilkårsvurderinger: UtdypendeVilkårsvurdering[] =
        bestemMuligeUtdypendeVilkårsvurderinger(
            avhengigheter.vurderesEtter,
            avhengigheter.resultat
        );

    if (muligeUtdypendeVilkårsvurderinger.length === 0) {
        return ok(felt);
    }
    if (!felt.verdi.every(item => muligeUtdypendeVilkårsvurderinger.includes(item))) {
        return feil(felt, 'Du har valgt en ugyldig kombinasjon');
    }

    const antallValgteAlternativerForDeltBosted = felt.verdi.filter(item =>
        Object.keys(UtdypendeVilkårsvurderingDeltBosted).includes(item)
    ).length;
    if (antallValgteAlternativerForDeltBosted > 1) {
        return feil(felt, 'Du kan kun velge ett alternativ for delt bosted');
    }

    if (avhengigheter.vurderesEtter === Regelverk.EØS_FORORDNINGEN) {
        const antallValgteAlternativerForHvemBarnetBorMed = felt.verdi.filter(item =>
            Object.keys(UtdypendeVilkårsvurderingEøsBarnBorMedSøker).includes(item)
        ).length;
        if (antallValgteAlternativerForHvemBarnetBorMed === 0) {
            return feil(felt, 'Du må velge ett alternativ for hvem barnet bor med');
        }
        if (antallValgteAlternativerForHvemBarnetBorMed > 1) {
            return feil(felt, 'Du kan kun velge ett alternativ for hvem barnet bor med');
        }
    }

    return ok(felt);
};

export const erBegrunnelseGyldig = (
    felt: FeltState<string>,
    avhengigheter?: Avhengigheter
): FeltState<string> => {
    if (!avhengigheter) {
        return feil(felt, 'Begrunnelse er ugyldig');
    }

    const begrunnelseOppgitt = felt.verdi.length > 0;

    if (avhengigheter.vurderesEtter === Regelverk.EØS_FORORDNINGEN) {
        return ok(felt);
    } else {
        if (begrunnelseOppgitt || avhengigheter?.utdypendeVilkårsvurdering.length === 0) {
            return ok(felt);
        }
        return feil(
            felt,
            'Du har gjort ett eller flere valg under "Utdypende vilkårsvurdering" og må derfor fylle inn en begrunnelse'
        );
    }
};
