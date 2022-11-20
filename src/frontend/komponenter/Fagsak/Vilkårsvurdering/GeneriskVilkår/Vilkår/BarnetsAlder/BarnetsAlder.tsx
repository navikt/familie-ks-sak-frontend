import React from 'react';

import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useVilkårSkjema } from '../../VilkårSkjemaContext';
import { muligeUtdypendeVilkårsvurderinger, useBarnetsAlder } from './BarnetsAlderContext';

type BarnetsAlderProps = IVilkårSkjemaBaseProps;

export const BarnetsAlder: React.FC<BarnetsAlderProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    toggleForm,
    person,
    lesevisning,
}: BarnetsAlderProps) => {
    const { felter } = useBarnetsAlder(vilkårResultat, person);
    const vilkårSkjemaContext = useVilkårSkjema(vilkårResultat, felter, person, toggleForm);
    return (
        <VilkårSkjema
            vilkårSkjemaContext={vilkårSkjemaContext}
            visVurderesEtter={false}
            visSpørsmål={true}
            muligeUtdypendeVilkårsvurderinger={muligeUtdypendeVilkårsvurderinger}
            vilkårResultat={vilkårResultat}
            vilkårFraConfig={vilkårFraConfig}
            toggleForm={toggleForm}
            person={person}
            lesevisning={lesevisning}
        />
    );
};
