import type { IGrunnlagPerson } from '@typer/person';
import { PersonType } from '@typer/person';
import {
    Regelverk,
    type UtdypendeVilkårsvurdering,
    UtdypendeVilkårsvurderingEøsBarnBosattIRiket,
    UtdypendeVilkårsvurderingEøsSøkerBosattIRiket,
    UtdypendeVilkårsvurderingGenerell,
} from '@typer/vilkår';
import { useWatch } from 'react-hook-form';

import { useVilkårResultatSkjema, VilkårResultatFelt } from '../../useVilkårResultatSkjema';
import { VilkårSkjema, type VilkårProps } from '../../VilkårSkjema';
import { VilkårTabellRad } from '../../VilkårTabellRad';

function bestemMuligeUtdypendeVilkårsvurderingerIBosattIRiketVilkår(
    vurderesEtter: Regelverk | null | undefined,
    person: IGrunnlagPerson
): UtdypendeVilkårsvurdering[] {
    if (vurderesEtter === Regelverk.EØS_FORORDNINGEN) {
        if (person.type === PersonType.SØKER) {
            return [
                UtdypendeVilkårsvurderingEøsSøkerBosattIRiket.OMFATTET_AV_NORSK_LOVGIVNING,
                UtdypendeVilkårsvurderingEøsSøkerBosattIRiket.OMFATTET_AV_NORSK_LOVGIVNING_UTLAND,
                UtdypendeVilkårsvurderingEøsSøkerBosattIRiket.ANNEN_FORELDER_OMFATTET_AV_NORSK_LOVGIVNING,
                UtdypendeVilkårsvurderingEøsSøkerBosattIRiket.SØKER_OMFATTET_AV_UTENLANDSK_LOVGIVNING_BOSATT_I_NORGE,
            ];
        }
        if (person.type === PersonType.BARN) {
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
}

export function BosattIRiket({
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
                muligeUtdypendeVilkårsvurderinger={bestemMuligeUtdypendeVilkårsvurderingerIBosattIRiketVilkår(
                    vurderesEtter,
                    person
                )}
            />
        </VilkårTabellRad>
    );
}
