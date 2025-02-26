import React, { useState } from 'react';

import {
    bestemMuligeUtdypendeVilkårsvurderingerIBosattIRiketVilkår,
    useBosattIRiket,
} from './BosattIRiketContext';
import { useBehandling } from '../../../../../../context/behandlingContext/BehandlingContext';
import type { Regelverk, UtdypendeVilkårsvurdering } from '../../../../../../typer/vilkår';
import { useVilkårEkspanderbarRad } from '../../useVilkårEkspanderbarRad';
import VilkårEkspanderbarRad from '../../VilkårEkspanderbarRad';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useVilkårSkjema } from '../../VilkårSkjemaContext';

type BosattIRiketProps = IVilkårSkjemaBaseProps;

export const BosattIRiket: React.FC<BosattIRiketProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    person,
}: BosattIRiketProps) => {
    const { vurderErLesevisning } = useBehandling();
    const erLesevisning = vurderErLesevisning();

    const { felter } = useBosattIRiket(vilkårResultat, person);

    const vilkårHarEndringerSomIkkeErLagret = () => {
        return true;
    };

    const { toggleForm, ekspandertVilkår } = useVilkårEkspanderbarRad({
        vilkårHarEndringerSomIkkeErLagret,
        lagretVilkårResultat: vilkårResultat,
    });

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
        <VilkårEkspanderbarRad
            vilkårResultat={vilkårResultat}
            ekspandertVilkår={ekspandertVilkår}
            toggleForm={toggleForm}
        >
            <VilkårSkjema
                vilkårSkjemaContext={vilkårSkjemaContext}
                visVurderesEtter={true}
                visSpørsmål={true}
                muligeUtdypendeVilkårsvurderinger={utdypendeVilkårsvurderinger}
                vilkårResultat={vilkårResultat}
                vilkårFraConfig={vilkårFraConfig}
                toggleForm={toggleForm}
                person={person}
                lesevisning={erLesevisning}
                vurderesEtterEndringer={(vurderesEtter: Regelverk): void => {
                    setUtdypendeVilkårsvurderinger(
                        bestemMuligeUtdypendeVilkårsvurderingerIBosattIRiketVilkår(
                            vurderesEtter,
                            person
                        )
                    );
                }}
            />
        </VilkårEkspanderbarRad>
    );
};
