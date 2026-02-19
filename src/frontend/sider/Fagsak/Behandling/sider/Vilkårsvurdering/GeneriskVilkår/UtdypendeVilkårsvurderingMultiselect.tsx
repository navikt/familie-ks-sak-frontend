import type { ReactNode } from 'react';

import { UNSAFE_Combobox } from '@navikt/ds-react';
import type { Felt } from '@navikt/familie-skjema';

import type { OptionType } from '../../../../../../typer/common';
import type { UtdypendeVilkårsvurdering } from '../../../../../../typer/vilkår';
import {
    UtdypendeVilkårsvurderingDeltBosted,
    UtdypendeVilkårsvurderingEøsBarnBorMedSøker,
    UtdypendeVilkårsvurderingEøsBarnBosattIRiket,
    UtdypendeVilkårsvurderingEøsSøkerBosattIRiket,
    UtdypendeVilkårsvurderingGenerell,
} from '../../../../../../typer/vilkår';

interface Props {
    utdypendeVilkårsvurderinger: Felt<UtdypendeVilkårsvurdering[]>;
    muligeUtdypendeVilkårsvurderinger?: UtdypendeVilkårsvurdering[];
    erLesevisning: boolean;
    feilhåndtering: ReactNode;
    children?: ReactNode;
}

const utdypendeVilkårsvurderingTekst: Record<UtdypendeVilkårsvurdering, string> = {
    [UtdypendeVilkårsvurderingGenerell.VURDERING_ANNET_GRUNNLAG]: 'Vurdering annet grunnlag',
    [UtdypendeVilkårsvurderingGenerell.BOSATT_PÅ_SVALBARD]: 'Bosatt på Svalbard',
    [UtdypendeVilkårsvurderingDeltBosted.DELT_BOSTED]: 'Delt bosted: skal deles',
    [UtdypendeVilkårsvurderingDeltBosted.DELT_BOSTED_SKAL_IKKE_DELES]: 'Delt bosted: skal ikke deles',
    [UtdypendeVilkårsvurderingGenerell.ADOPSJON]: 'Adopsjon',
    [UtdypendeVilkårsvurderingGenerell.SOMMERFERIE]: 'Sommerferie',
    // EØS
    [UtdypendeVilkårsvurderingEøsBarnBorMedSøker.BARN_BOR_I_NORGE_MED_SØKER]: 'Barn bor i Norge med søker',
    [UtdypendeVilkårsvurderingEøsBarnBorMedSøker.BARN_BOR_I_EØS_MED_SØKER]: 'Barn bor i EØS-land med søker',
    [UtdypendeVilkårsvurderingEøsBarnBorMedSøker.BARN_BOR_I_EØS_MED_ANNEN_FORELDER]:
        'Barn bor i EØS-land med annen forelder (EFTA)',
    [UtdypendeVilkårsvurderingEøsBarnBorMedSøker.BARN_BOR_I_STORBRITANNIA_MED_SØKER]:
        'Barn bor i Storbritannia med søker',
    [UtdypendeVilkårsvurderingEøsBarnBorMedSøker.BARN_BOR_I_STORBRITANNIA_MED_ANNEN_FORELDER]:
        'Barn bor i Storbritannia med annen forelder (EFTA)',
    [UtdypendeVilkårsvurderingEøsBarnBorMedSøker.BARN_BOR_ALENE_I_ANNET_EØS_LAND]: 'Barn bor alene i annet EØS-land',
    [UtdypendeVilkårsvurderingEøsSøkerBosattIRiket.OMFATTET_AV_NORSK_LOVGIVNING]: 'Omfattet av norsk lovgivning',
    [UtdypendeVilkårsvurderingEøsSøkerBosattIRiket.OMFATTET_AV_NORSK_LOVGIVNING_UTLAND]:
        'Omfattet av norsk lovgivning Utland',
    [UtdypendeVilkårsvurderingEøsSøkerBosattIRiket.ANNEN_FORELDER_OMFATTET_AV_NORSK_LOVGIVNING]:
        'Annen forelder omfattet av norsk lovgivning',
    [UtdypendeVilkårsvurderingEøsSøkerBosattIRiket.SØKER_OMFATTET_AV_UTENLANDSK_LOVGIVNING_BOSATT_I_NORGE]:
        'Søker omfattet av utenlandsk lovgivning – bosatt i Norge',
    [UtdypendeVilkårsvurderingEøsBarnBosattIRiket.BARN_BOR_I_NORGE]: 'Barn bor i Norge',
    [UtdypendeVilkårsvurderingEøsBarnBosattIRiket.BARN_BOR_I_EØS]: 'Barn bor i EØS-land',
    [UtdypendeVilkårsvurderingEøsBarnBosattIRiket.BARN_BOR_I_STORBRITANNIA]: 'Barn bor i Storbritannia',
};

const mapUtdypendeVilkårsvurderingTilOption = (utdypendeVilkårsvurdering: UtdypendeVilkårsvurdering): OptionType => ({
    value: utdypendeVilkårsvurdering,
    label: utdypendeVilkårsvurderingTekst[utdypendeVilkårsvurdering],
});

export const UtdypendeVilkårsvurderingMultiselect = ({
    utdypendeVilkårsvurderinger,
    muligeUtdypendeVilkårsvurderinger,
    erLesevisning,
    feilhåndtering,
    children,
}: Props) => {
    const håndterEndring = (option: string, isSelected: boolean) => {
        if (isSelected) {
            utdypendeVilkårsvurderinger.validerOgSettFelt([
                ...utdypendeVilkårsvurderinger.verdi,
                option as UtdypendeVilkårsvurdering,
            ]);
        } else {
            utdypendeVilkårsvurderinger.validerOgSettFelt(
                utdypendeVilkårsvurderinger.verdi.filter(utdypendeVurdering => utdypendeVurdering !== option)
            );
        }
    };

    if (!muligeUtdypendeVilkårsvurderinger || muligeUtdypendeVilkårsvurderinger.length === 0) {
        return null;
    }

    return (
        <>
            <UNSAFE_Combobox
                label="Utdypende vilkårsvurdering"
                selectedOptions={utdypendeVilkårsvurderinger.verdi.map(mapUtdypendeVilkårsvurderingTilOption)}
                readOnly={erLesevisning}
                isMultiSelect
                onToggleSelected={håndterEndring}
                options={muligeUtdypendeVilkårsvurderinger.map(mapUtdypendeVilkårsvurderingTilOption)}
                error={feilhåndtering}
            />
            {children}
        </>
    );
};
