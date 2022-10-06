import React from 'react';

import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useMellom1Og2EllerAdopsjon } from './Mellom1Og2EllerAdopsjonContext';

type Mellom1Og2EllerAdopsjonProps = IVilkårSkjemaBaseProps;

export const Mellom1Og2EllerAdopsjon: React.FC<Mellom1Og2EllerAdopsjonProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    toggleForm,
    person,
    lesevisning,
}: Mellom1Og2EllerAdopsjonProps) => {
    const { felter } = useMellom1Og2EllerAdopsjon(vilkårResultat, person);
    return (
        <VilkårSkjema
            visVurderesEtter={false}
            vilkårResultat={vilkårResultat}
            vilkårFraConfig={vilkårFraConfig}
            felter={felter}
            toggleForm={toggleForm}
            person={person}
            lesevisning={lesevisning}
        />
    );
};
