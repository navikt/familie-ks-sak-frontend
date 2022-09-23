import type { CSSProperties, ReactNode } from 'react';
import React, { useEffect } from 'react';

import type { ActionMeta, ISelectOption } from '@navikt/familie-form-elements';
import { FamilieReactSelect } from '@navikt/familie-form-elements';
import type { Felt } from '@navikt/familie-skjema';

import { useApp } from '../../../../context/AppContext';
import type { PersonType } from '../../../../typer/person';
import { ToggleNavn } from '../../../../typer/toggles';
import {
    UtdypendeVilkårsvurderingDeltBosted,
    UtdypendeVilkårsvurderingEøsBarnBorMedSøker,
    UtdypendeVilkårsvurderingEøsBarnBosattIRiket,
    UtdypendeVilkårsvurderingEøsSøkerBosattIRiket,
    UtdypendeVilkårsvurderingGenerell,
    UtdypendeVilkårsvurderingNasjonal,
} from '../../../../typer/vilkår';
import type {
    UtdypendeVilkårsvurdering,
    IVilkårResultat,
    Regelverk,
    Resultat,
} from '../../../../typer/vilkår';
import type { UtdypendeVilkårsvurderingAvhengigheter } from '../../../../utils/utdypendeVilkårsvurderinger';
import {
    bestemMuligeUtdypendeVilkårsvurderinger,
    fjernUmuligeAlternativerFraRedigerbartVilkår,
} from '../../../../utils/utdypendeVilkårsvurderinger';

interface Props {
    vilkårResultat: IVilkårResultat;
    utdypendeVilkårsvurderinger: Felt<UtdypendeVilkårsvurdering[]>;
    resultat: Felt<Resultat>;
    vurderesEtter: Felt<Regelverk | undefined>;
    erLesevisning: boolean;
    personType: PersonType;
    feilhåndtering: ReactNode;
}

const utdypendeVilkårsvurderingTekst: Record<UtdypendeVilkårsvurdering, string> = {
    [UtdypendeVilkårsvurderingGenerell.VURDERING_ANNET_GRUNNLAG]: 'Vurdering annet grunnlag',
    [UtdypendeVilkårsvurderingNasjonal.VURDERT_MEDLEMSKAP]: 'Vurdert medlemskap',
    [UtdypendeVilkårsvurderingDeltBosted.DELT_BOSTED]: 'Delt bosted: skal deles',
    [UtdypendeVilkårsvurderingDeltBosted.DELT_BOSTED_SKAL_IKKE_DELES]:
        'Delt bosted: skal ikke deles',
    [UtdypendeVilkårsvurderingEøsSøkerBosattIRiket.OMFATTET_AV_NORSK_LOVGIVNING]:
        'Omfattet av norsk lovgivning',
    [UtdypendeVilkårsvurderingEøsSøkerBosattIRiket.OMFATTET_AV_NORSK_LOVGIVNING_UTLAND]:
        'Omfattet av norsk lovgivning Utland',
    [UtdypendeVilkårsvurderingEøsBarnBosattIRiket.BARN_BOR_I_NORGE]: 'Barn bor i Norge',
    [UtdypendeVilkårsvurderingEøsBarnBosattIRiket.BARN_BOR_I_EØS]: 'Barn bor i EØS-land',
    [UtdypendeVilkårsvurderingEøsBarnBosattIRiket.BARN_BOR_I_STORBRITANNIA]:
        'Barn bor i Storbritannia',
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
};

const mapUtdypendeVilkårsvurderingTilOption = (
    utdypendeVilkårsvurdering: UtdypendeVilkårsvurdering
): ISelectOption => ({
    value: utdypendeVilkårsvurdering,
    label: utdypendeVilkårsvurderingTekst[utdypendeVilkårsvurdering],
});

export const UtdypendeVilkårsvurderingMultiselect: React.FC<Props> = ({
    vilkårResultat,
    utdypendeVilkårsvurderinger,
    resultat,
    vurderesEtter,
    erLesevisning,
    personType,
    feilhåndtering,
}) => {
    const { toggles } = useApp();

    const utdypendeVilkårsvurderingAvhengigheter: UtdypendeVilkårsvurderingAvhengigheter = {
        personType,
        vilkårType: vilkårResultat.vilkårType,
        resultat: resultat.verdi,
        vurderesEtter: vurderesEtter.verdi,
        brukEøs: toggles[ToggleNavn.brukEøs],
    };

    const muligeUtdypendeVilkårsvurderinger = bestemMuligeUtdypendeVilkårsvurderinger(
        utdypendeVilkårsvurderingAvhengigheter
    );
    useEffect(() => {
        fjernUmuligeAlternativerFraRedigerbartVilkår(
            utdypendeVilkårsvurderinger,
            muligeUtdypendeVilkårsvurderinger
        );
    }, [vilkårResultat, utdypendeVilkårsvurderingAvhengigheter]);

    const håndterEndring = (action: ActionMeta<ISelectOption>) => {
        switch (action.action) {
            case 'select-option':
            case 'set-value':
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

    if (muligeUtdypendeVilkårsvurderinger.length === 0) {
        return null;
    }

    return (
        <FamilieReactSelect
            id="UtdypendeVilkarsvurderingMultiselect"
            label="Utdypende vilkårsvurdering"
            value={utdypendeVilkårsvurderinger.verdi.map(mapUtdypendeVilkårsvurderingTilOption)}
            propSelectStyles={{
                menu: (provided: CSSProperties) => ({
                    ...provided,
                    zIndex: '3',
                }),
            }}
            creatable={false}
            erLesevisning={erLesevisning}
            isMulti
            onChange={(_, action: ActionMeta<ISelectOption>) => {
                håndterEndring(action);
            }}
            options={muligeUtdypendeVilkårsvurderinger.map(mapUtdypendeVilkårsvurderingTilOption)}
            feil={feilhåndtering}
        />
    );
};
