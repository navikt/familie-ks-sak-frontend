import React from 'react';

import type { IVilkårSkjemaBaseProps } from '../../GeneriskVilkår/VilkårSkjema';
import { VilkårSkjema } from '../../GeneriskVilkår/VilkårSkjema';
import { useLovligOpphold } from './LovligOppholdContext';

type BosattIRiketProps = IVilkårSkjemaBaseProps;

export const LovligOpphold: React.FC<BosattIRiketProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    toggleForm,
    person,
    lesevisning,
}: BosattIRiketProps) => {
    const { felter } = useLovligOpphold(vilkårResultat, person);
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
