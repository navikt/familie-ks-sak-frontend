import React, { useState } from 'react';

import {
    bestemMuligeUtdypendeVilkårsvurderingerIBosattIRiketVilkår,
    useBosattIRiket,
} from './BosattIRiketContext';
import type { Regelverk, UtdypendeVilkårsvurdering } from '../../../../../../typer/vilkår';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useVilkårSkjema } from '../../VilkårSkjemaContext';

type BosattIRiketProps = IVilkårSkjemaBaseProps;

export const BosattIRiket: React.FC<BosattIRiketProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    toggleForm,
    person,
    lesevisning,
}: BosattIRiketProps) => {
    const { felter } = useBosattIRiket(vilkårResultat, person);
    const [utdypendeVilkårsvurderinger, setUtdypendeVilkårsvurderinger] = useState<
        UtdypendeVilkårsvurdering[]
    >(
        bestemMuligeUtdypendeVilkårsvurderingerIBosattIRiketVilkår(
            vilkårResultat.vurderesEtter,
            person
        )
    );
    const vilkårSkjemaContext = useVilkårSkjema(vilkårResultat, felter, person);
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
                    bestemMuligeUtdypendeVilkårsvurderingerIBosattIRiketVilkår(
                        vurderesEtter,
                        person
                    )
                );
            }}
        />
    );
};
