import type { ReactNode } from 'react';
import React from 'react';

import styled from 'styled-components';

import type { ActionMeta } from '@navikt/familie-form-elements';
import { FamilieReactSelect } from '@navikt/familie-form-elements';
import type { Felt } from '@navikt/familie-skjema';

import type { OptionType } from '../../../../../../typer/common';
import {
    UtdypendeVilkårsvurderingDeltBosted,
    UtdypendeVilkårsvurderingEøsBarnBorMedSøker,
    UtdypendeVilkårsvurderingEøsBarnBosattIRiket,
    UtdypendeVilkårsvurderingEøsSøkerBosattIRiket,
    UtdypendeVilkårsvurderingGenerell,
} from '../../../../../../typer/vilkår';
import type { UtdypendeVilkårsvurdering } from '../../../../../../typer/vilkår';

interface Props {
    utdypendeVilkårsvurderinger: Felt<UtdypendeVilkårsvurdering[]>;
    muligeUtdypendeVilkårsvurderinger?: UtdypendeVilkårsvurdering[];
    erLesevisning: boolean;
    feilhåndtering: ReactNode;
    children?: ReactNode;
}

const utdypendeVilkårsvurderingTekst: Record<UtdypendeVilkårsvurdering, string> = {
    [UtdypendeVilkårsvurderingGenerell.VURDERING_ANNET_GRUNNLAG]: 'Vurdering annet grunnlag',
    [UtdypendeVilkårsvurderingDeltBosted.DELT_BOSTED]: 'Delt bosted: skal deles',
    [UtdypendeVilkårsvurderingDeltBosted.DELT_BOSTED_SKAL_IKKE_DELES]:
        'Delt bosted: skal ikke deles',
    [UtdypendeVilkårsvurderingGenerell.ADOPSJON]: 'Adopsjon',
    [UtdypendeVilkårsvurderingGenerell.SOMMERFERIE]: 'Sommerferie',
    // EØS
    [UtdypendeVilkårsvurderingEøsBarnBorMedSøker.BARN_BOR_I_NORGE_MED_SØKER]:
        'Barn bor i Norge med søker',
    [UtdypendeVilkårsvurderingEøsBarnBorMedSøker.BARN_BOR_I_EØS_MED_SØKER]:
        'Barn bor i EØS-land med søker',
    [UtdypendeVilkårsvurderingEøsBarnBorMedSøker.BARN_BOR_I_EØS_MED_ANNEN_FORELDER]:
        'Barn bor i EØS-land med annen forelder (EFTA)',
    [UtdypendeVilkårsvurderingEøsBarnBorMedSøker.BARN_BOR_I_STORBRITANNIA_MED_SØKER]:
        'Barn bor i Storbritannia med søker',
    [UtdypendeVilkårsvurderingEøsBarnBorMedSøker.BARN_BOR_I_STORBRITANNIA_MED_ANNEN_FORELDER]:
        'Barn bor i Storbritannia med annen forelder (EFTA)',
    [UtdypendeVilkårsvurderingEøsBarnBorMedSøker.BARN_BOR_ALENE_I_ANNET_EØS_LAND]:
        'Barn bor alene i annet EØS-land',
    [UtdypendeVilkårsvurderingEøsSøkerBosattIRiket.OMFATTET_AV_NORSK_LOVGIVNING]:
        'Omfattet av norsk lovgivning',
    [UtdypendeVilkårsvurderingEøsSøkerBosattIRiket.OMFATTET_AV_NORSK_LOVGIVNING_UTLAND]:
        'Omfattet av norsk lovgivning Utland',
    [UtdypendeVilkårsvurderingEøsSøkerBosattIRiket.ANNEN_FORELDER_OMFATTET_AV_NORSK_LOVGIVNING]:
        'Annen forelder omfattet av norsk lovgivning',
    [UtdypendeVilkårsvurderingEøsBarnBosattIRiket.BARN_BOR_I_NORGE]: 'Barn bor i Norge',
    [UtdypendeVilkårsvurderingEøsBarnBosattIRiket.BARN_BOR_I_EØS]: 'Barn bor i EØS-land',
    [UtdypendeVilkårsvurderingEøsBarnBosattIRiket.BARN_BOR_I_STORBRITANNIA]:
        'Barn bor i Storbritannia',
};

const StyledFamilieReactSelect = styled(FamilieReactSelect)`
    margin-top: 0.75rem;
`;

const mapUtdypendeVilkårsvurderingTilOption = (
    utdypendeVilkårsvurdering: UtdypendeVilkårsvurdering
): OptionType => ({
    value: utdypendeVilkårsvurdering,
    label: utdypendeVilkårsvurderingTekst[utdypendeVilkårsvurdering],
});

export const UtdypendeVilkårsvurderingMultiselect: React.FC<Props> = ({
    utdypendeVilkårsvurderinger,
    muligeUtdypendeVilkårsvurderinger,
    erLesevisning,
    feilhåndtering,
    children,
}) => {
    const håndterEndring = (action: ActionMeta<OptionType>) => {
        switch (action.action) {
            case 'select-option':
                utdypendeVilkårsvurderinger.validerOgSettFelt([
                    ...utdypendeVilkårsvurderinger.verdi,
                    action.option?.value as UtdypendeVilkårsvurdering,
                ]);
                break;
            case 'deselect-option':
            case 'remove-value':
            case 'pop-value': {
                utdypendeVilkårsvurderinger.validerOgSettFelt(
                    utdypendeVilkårsvurderinger.verdi.filter(
                        utdypendeVurdering => utdypendeVurdering !== action.removedValue?.value
                    )
                );
                break;
            }
            case 'clear':
                utdypendeVilkårsvurderinger.validerOgSettFelt([]);
                break;
            case 'create-option':
                break;
        }
    };

    if (!muligeUtdypendeVilkårsvurderinger || muligeUtdypendeVilkårsvurderinger.length === 0) {
        return null;
    }

    return (
        <>
            <StyledFamilieReactSelect
                id="UtdypendeVilkarsvurderingMultiselect"
                label="Utdypende vilkårsvurdering"
                value={utdypendeVilkårsvurderinger.verdi.map(mapUtdypendeVilkårsvurderingTilOption)}
                propSelectStyles={{
                    menu: provided => ({
                        ...provided,
                        zIndex: 3,
                    }),
                }}
                creatable={false}
                erLesevisning={erLesevisning}
                isMulti
                onChange={(_, action: ActionMeta<OptionType>) => {
                    håndterEndring(action);
                }}
                options={muligeUtdypendeVilkårsvurderinger.map(
                    mapUtdypendeVilkårsvurderingTilOption
                )}
                feil={feilhåndtering}
            />
            {children}
        </>
    );
};
