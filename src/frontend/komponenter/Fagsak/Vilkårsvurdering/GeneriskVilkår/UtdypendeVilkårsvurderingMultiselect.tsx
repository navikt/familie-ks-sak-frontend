import type { ReactNode } from 'react';
import React from 'react';

import styled from 'styled-components';

import type { ActionMeta, ISelectOption } from '@navikt/familie-form-elements';
import { FamilieReactSelect } from '@navikt/familie-form-elements';
import type { Felt } from '@navikt/familie-skjema';

import { UtdypendeVilkårsvurdering } from '../../../../typer/vilkår';

interface Props {
    utdypendeVilkårsvurderinger: Felt<UtdypendeVilkårsvurdering[]>;
    muligeUtdypendeVilkårsvurderinger?: UtdypendeVilkårsvurdering[];
    erLesevisning: boolean;
    feilhåndtering: ReactNode;
}

const utdypendeVilkårsvurderingTekst: Record<UtdypendeVilkårsvurdering, string> = {
    [UtdypendeVilkårsvurdering.VURDERING_ANNET_GRUNNLAG]: 'Vurdering annet grunnlag',
    [UtdypendeVilkårsvurdering.DELT_BOSTED]: 'Delt bosted: skal deles',
    [UtdypendeVilkårsvurdering.DELT_BOSTED_SKAL_IKKE_DELES]: 'Delt bosted: skal ikke deles',
    [UtdypendeVilkårsvurdering.ADOPSJON]: 'Adopsjon',
    [UtdypendeVilkårsvurdering.SOMMERFERIE]: 'Sommerferie',
};

const StyledFamilieReactSelect = styled(FamilieReactSelect)`
    margin-top: 0.75rem;
`;

const mapUtdypendeVilkårsvurderingTilOption = (
    utdypendeVilkårsvurdering: UtdypendeVilkårsvurdering
): ISelectOption => ({
    value: utdypendeVilkårsvurdering,
    label: utdypendeVilkårsvurderingTekst[utdypendeVilkårsvurdering],
});

export const UtdypendeVilkårsvurderingMultiselect: React.FC<Props> = ({
    utdypendeVilkårsvurderinger,
    muligeUtdypendeVilkårsvurderinger,
    erLesevisning,
    feilhåndtering,
}) => {
    const håndterEndring = (action: ActionMeta<ISelectOption>) => {
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
            onChange={(_, action: ActionMeta<ISelectOption>) => {
                håndterEndring(action);
            }}
            options={muligeUtdypendeVilkårsvurderinger.map(mapUtdypendeVilkårsvurderingTilOption)}
            feil={feilhåndtering}
        />
    );
};
