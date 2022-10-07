import React from 'react';

import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useVilkårSkjema } from '../../VilkårSkjemaContext';
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
    const vilkårSkjemaContext = useVilkårSkjema(vilkårResultat, felter, person, toggleForm);
    return (
        <VilkårSkjema
            vilkårSkjemaContext={vilkårSkjemaContext}
            visVurderesEtter={false}
            visSpørsmål={true}
            vilkårResultat={vilkårResultat}
            vilkårFraConfig={vilkårFraConfig}
            toggleForm={toggleForm}
            person={person}
            lesevisning={lesevisning}
        />
    );
};
