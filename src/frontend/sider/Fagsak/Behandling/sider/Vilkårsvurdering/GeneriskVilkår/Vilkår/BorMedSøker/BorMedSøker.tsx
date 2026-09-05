import {
    Regelverk,
    type UtdypendeVilkårsvurdering,
    UtdypendeVilkårsvurderingDeltBosted,
    UtdypendeVilkårsvurderingEøsBarnBorMedSøker,
    UtdypendeVilkårsvurderingGenerell,
} from '@typer/vilkår';
import { useWatch } from 'react-hook-form';

import { useVilkårResultatSkjema, VilkårResultatFelt } from '../../useVilkårResultatSkjema';
import { VilkårSkjema, type VilkårProps } from '../../VilkårSkjema';
import { VilkårTabellRad } from '../../VilkårTabellRad';

function bestemMuligeUtdypendeVilkårsvurderingerIBorMedSøkerVilkår(
    vurderesEtter: Regelverk | null | undefined
): UtdypendeVilkårsvurdering[] {
    if (vurderesEtter === Regelverk.EØS_FORORDNINGEN) {
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
}

export function BorMedSøker({
    lagretVilkårResultat,
    vilkårFraConfig,
    person,
    settFokusPåLeggTilPeriodeKnapp,
}: VilkårProps) {
    const { form, onSubmit } = useVilkårResultatSkjema({
        lagretVilkårResultat,
        person,
        settFokusPåLeggTilPeriodeKnapp,
    });

    const vurderesEtter = useWatch({ control: form.control, name: VilkårResultatFelt.VURDERES_ETTER });

    return (
        <VilkårTabellRad lagretVilkårResultat={lagretVilkårResultat} form={form} onSubmit={onSubmit}>
            <VilkårSkjema
                lagretVilkårResultat={lagretVilkårResultat}
                vilkårFraConfig={vilkårFraConfig}
                person={person}
                visVurderesEtter
                visSpørsmål
                muligeUtdypendeVilkårsvurderinger={bestemMuligeUtdypendeVilkårsvurderingerIBorMedSøkerVilkår(
                    vurderesEtter
                )}
            />
        </VilkårTabellRad>
    );
}
