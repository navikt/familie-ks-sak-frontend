import type { ReactNode } from 'react';
import React, { useEffect } from 'react';

import styled from 'styled-components';

import type { ActionMeta, ISelectOption } from '@navikt/familie-form-elements';
import { FamilieReactSelect } from '@navikt/familie-form-elements';
import type { Felt } from '@navikt/familie-skjema';

import { useApp } from '../../../../context/AppContext';
import type { PersonType } from '../../../../typer/person';
import { ToggleNavn } from '../../../../typer/toggles';
import { UtdypendeVilkårsvurdering } from '../../../../typer/vilkår';
import type { IVilkårResultat, Regelverk, Resultat } from '../../../../typer/vilkår';
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
    [UtdypendeVilkårsvurdering.VURDERING_ANNET_GRUNNLAG]: 'Vurdering annet grunnlag',
    [UtdypendeVilkårsvurdering.DELT_BOSTED]: 'Delt bosted: skal deles',
    [UtdypendeVilkårsvurdering.ADOPSJON]: 'Adopsjon',
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
        <StyledFamilieReactSelect
            id="UtdypendeVilkarsvurderingMultiselect"
            label="Utdypende vilkårsvurdering"
            value={utdypendeVilkårsvurderinger.verdi.map(mapUtdypendeVilkårsvurderingTilOption)}
            propSelectStyles={{
                menu: provided => ({
                    ...provided,
                    ZIndex: '3',
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
