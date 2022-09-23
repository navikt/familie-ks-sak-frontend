import React from 'react';

import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useUtvidetBarnetrygd } from './UtvidetBarnetrygdContext';

type BosattIRiketProps = IVilkårSkjemaBaseProps;

export const UtvidetBarnetrygd: React.FC<BosattIRiketProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    toggleForm,
    person,
    lesevisning,
}: BosattIRiketProps) => {
    const { felter } = useUtvidetBarnetrygd(vilkårResultat, person);
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
