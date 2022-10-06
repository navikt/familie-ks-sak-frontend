import type { Felt } from '@navikt/familie-skjema';

import type { PersonType } from '../typer/person';
import type { Resultat } from '../typer/vilkår';
import {
    Regelverk,
    UtdypendeVilkårsvurdering,
    UtdypendeVilkårsvurderingEøsBarnBorMedSøker,
    VilkårType,
} from '../typer/vilkår';

export interface UtdypendeVilkårsvurderingAvhengigheter {
    personType: PersonType;
    vilkårType: VilkårType;
    resultat: Resultat;
    vurderesEtter: Regelverk | undefined;
    brukEøs: boolean;
}

export const bestemMuligeUtdypendeVilkårsvurderinger = (
    avhengigheter: UtdypendeVilkårsvurderingAvhengigheter
): UtdypendeVilkårsvurdering[] => {
    const { vilkårType } = avhengigheter;
    if (vilkårType === VilkårType.BOSATT_I_RIKET) {
        return [UtdypendeVilkårsvurdering.VURDERING_ANNET_GRUNNLAG];
    }
    if (vilkårType === VilkårType.BOR_MED_SØKER) {
        return [
            UtdypendeVilkårsvurdering.VURDERING_ANNET_GRUNNLAG,
            UtdypendeVilkårsvurdering.DELT_BOSTED,
        ];
    }
    if (vilkårType === VilkårType.MELLOM_1_OG_2_ELLER_ADOPTERT) {
        return [UtdypendeVilkårsvurdering.ADOPSJON];
    }
    return [];
};

export const bestemFeilmeldingForUtdypendeVilkårsvurdering = (
    utdypendeVilkårsvurderinger: UtdypendeVilkårsvurdering[],
    avhengigheter: UtdypendeVilkårsvurderingAvhengigheter
): string | undefined => {
    const muligeUtdypendeVilkårsvurderinger: UtdypendeVilkårsvurdering[] =
        bestemMuligeUtdypendeVilkårsvurderinger(avhengigheter);

    if (muligeUtdypendeVilkårsvurderinger.length === 0) {
        return;
    }
    if (
        !utdypendeVilkårsvurderinger.every(item => muligeUtdypendeVilkårsvurderinger.includes(item))
    ) {
        return 'Du har valgt en ugyldig kombinasjon';
    }

    if (avhengigheter.vilkårType === VilkårType.BOR_MED_SØKER) {
        const antallValgteAlternativerForDeltBosted = utdypendeVilkårsvurderinger.filter(
            item => item === UtdypendeVilkårsvurdering.DELT_BOSTED
        ).length;
        if (antallValgteAlternativerForDeltBosted > 1) {
            return 'Du kan kun velge ett alternativ for delt bosted';
        }
    }

    if (avhengigheter.vurderesEtter === Regelverk.EØS_FORORDNINGEN) {
        if (avhengigheter.vilkårType === VilkårType.BOSATT_I_RIKET) {
            if (utdypendeVilkårsvurderinger.length === 0) {
                return 'Du må velge ett alternativ';
            }
            if (utdypendeVilkårsvurderinger.length > 1) {
                return 'Du kan kun velge ett alternativ';
            }
        }
        if (avhengigheter.vilkårType === VilkårType.BOR_MED_SØKER) {
            const antallValgteAlternativerForHvemBarnetBorMed = utdypendeVilkårsvurderinger.filter(
                item => Object.keys(UtdypendeVilkårsvurderingEøsBarnBorMedSøker).includes(item)
            ).length;
            if (antallValgteAlternativerForHvemBarnetBorMed === 0) {
                return 'Du må velge ett alternativ for hvem barnet bor med';
            }
            if (antallValgteAlternativerForHvemBarnetBorMed > 1) {
                return 'Du kan kun velge ett alternativ for hvem barnet bor med';
            }
        }
    }
};

export const inneholderUmuligeAlternativer = (
    valgteAlternativer: UtdypendeVilkårsvurdering[],
    muligeAlternativer: UtdypendeVilkårsvurdering[]
): boolean => {
    return valgteAlternativer.some(item => !muligeAlternativer.includes(item));
};

export const filtrerUtUmuligeAlternativer = (
    valgteAlternativer: UtdypendeVilkårsvurdering[],
    muligeAlternativer: UtdypendeVilkårsvurdering[]
): UtdypendeVilkårsvurdering[] => {
    return valgteAlternativer.filter(item => muligeAlternativer.includes(item));
};

export const fjernUmuligeAlternativerFraRedigerbartVilkår = (
    utdypendeVilkårsvurderinger: Felt<UtdypendeVilkårsvurdering[]>,
    muligeAlternativer: UtdypendeVilkårsvurdering[]
) => {
    if (inneholderUmuligeAlternativer(utdypendeVilkårsvurderinger.verdi, muligeAlternativer)) {
        utdypendeVilkårsvurderinger.validerOgSettFelt(
            filtrerUtUmuligeAlternativer(utdypendeVilkårsvurderinger.verdi, muligeAlternativer)
        );
    }
};
