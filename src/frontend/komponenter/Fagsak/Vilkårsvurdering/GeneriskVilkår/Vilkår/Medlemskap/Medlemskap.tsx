import React from 'react';

import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useVilkårSkjema } from '../../VilkårSkjemaContext';
import { useMedlemskap } from './MedlemskapContext';

type MedlemskapProps = IVilkårSkjemaBaseProps;

export const Medlemskap: React.FC<MedlemskapProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    toggleForm,
    person,
    lesevisning,
}: MedlemskapProps) => {
    const { felter } = useMedlemskap(vilkårResultat, person);
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
