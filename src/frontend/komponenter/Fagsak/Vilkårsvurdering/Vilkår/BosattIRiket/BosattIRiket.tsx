import React from 'react';

import type { IVilkårSkjemaBaseProps } from '../../GeneriskVilkår/VilkårSkjema';
import { VilkårSkjema } from '../../GeneriskVilkår/VilkårSkjema';
import { useBosattIRiket } from './BosattIRiketContext';

type BosattIRiketProps = IVilkårSkjemaBaseProps;

export const BosattIRiket: React.FC<BosattIRiketProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    toggleForm,
    person,
    lesevisning,
}: BosattIRiketProps) => {
    const { felter } = useBosattIRiket(vilkårResultat, person);
    return (
        <VilkårSkjema
            visVurderesEtter={true}
            vilkårResultat={vilkårResultat}
            vilkårFraConfig={vilkårFraConfig}
            felter={felter}
            toggleForm={toggleForm}
            person={person}
            lesevisning={lesevisning}
        />
    );
};
