import React from 'react';

import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useBarnehageplass } from './BarnehageplassContext';

type Mellom1Og2EllerAdopsjonProps = IVilkårSkjemaBaseProps;

export const Barnehageplass: React.FC<Mellom1Og2EllerAdopsjonProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    toggleForm,
    person,
    lesevisning,
}: Mellom1Og2EllerAdopsjonProps) => {
    const { felter } = useBarnehageplass(vilkårResultat, person);
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
