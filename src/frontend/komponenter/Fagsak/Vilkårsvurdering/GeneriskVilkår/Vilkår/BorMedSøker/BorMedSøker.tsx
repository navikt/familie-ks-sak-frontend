import React, { useState } from 'react';

import {
    bestemMuligeUtdypendeVilkårsvurderingerIBorMedSøkerVilkår,
    useBorMedSøker,
} from './BorMedSøkerContext';
import type { Regelverk, UtdypendeVilkårsvurdering } from '../../../../../../typer/vilkår';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useVilkårSkjema } from '../../VilkårSkjemaContext';

type BosattIRiketProps = IVilkårSkjemaBaseProps;

export const BorMedSøker: React.FC<BosattIRiketProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    toggleForm,
    person,
    lesevisning,
}: BosattIRiketProps) => {
    const { felter } = useBorMedSøker(vilkårResultat, person);
    const vilkårSkjemaContext = useVilkårSkjema(vilkårResultat, felter, person, toggleForm);
    const [utdypendeVilkårsvurderinger, setUtdypendeVilkårsvurderinger] = useState<
        UtdypendeVilkårsvurdering[]
    >(bestemMuligeUtdypendeVilkårsvurderingerIBorMedSøkerVilkår(vilkårResultat.vurderesEtter));
    return (
        <VilkårSkjema
            vilkårSkjemaContext={vilkårSkjemaContext}
            visVurderesEtter={true}
            visSpørsmål={true}
            muligeUtdypendeVilkårsvurderinger={utdypendeVilkårsvurderinger}
            vilkårResultat={vilkårResultat}
            vilkårFraConfig={vilkårFraConfig}
            toggleForm={toggleForm}
            person={person}
            lesevisning={lesevisning}
            vurderesEtterEndringer={(vurderesEtter: Regelverk): void => {
                setUtdypendeVilkårsvurderinger(
                    bestemMuligeUtdypendeVilkårsvurderingerIBorMedSøkerVilkår(vurderesEtter)
                );
            }}
        />
    );
};
