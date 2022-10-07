import React from 'react';

import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useMedlemskapAnnenForelder } from './MedlemskapAnnenForelderContext';

type MedlemskapAnnenForelderProps = IVilkårSkjemaBaseProps;

export const MedlemskapAnnenForelder: React.FC<MedlemskapAnnenForelderProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    toggleForm,
    person,
    lesevisning,
}: MedlemskapAnnenForelderProps) => {
    const { felter } = useMedlemskapAnnenForelder(vilkårResultat, person);
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
