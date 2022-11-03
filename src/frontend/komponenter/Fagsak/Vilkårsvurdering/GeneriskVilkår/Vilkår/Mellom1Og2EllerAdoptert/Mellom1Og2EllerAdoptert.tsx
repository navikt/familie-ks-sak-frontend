import React from 'react';

import { UtdypendeVilkårsvurdering } from '../../../../../../typer/vilkår';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useVilkårSkjema } from '../../VilkårSkjemaContext';
import { useMellom1Og2EllerAdoptert } from './Mellom1Og2EllerAdoptertContext';

type Mellom1Og2EllerAdopsjonProps = IVilkårSkjemaBaseProps;

export const Mellom1Og2EllerAdoptert: React.FC<Mellom1Og2EllerAdopsjonProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    toggleForm,
    person,
    lesevisning,
}: Mellom1Og2EllerAdopsjonProps) => {
    const { felter } = useMellom1Og2EllerAdoptert(vilkårResultat, person);
    const vilkårSkjemaContext = useVilkårSkjema(vilkårResultat, felter, person, toggleForm);
    return (
        <VilkårSkjema
            vilkårSkjemaContext={vilkårSkjemaContext}
            visVurderesEtter={false}
            visSpørsmål={true}
            utdypendeVilkårsvurderinger={[UtdypendeVilkårsvurdering.ADOPSJON]}
            vilkårResultat={vilkårResultat}
            vilkårFraConfig={vilkårFraConfig}
            toggleForm={toggleForm}
            person={person}
            lesevisning={lesevisning}
        />
    );
};
