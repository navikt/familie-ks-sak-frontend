import React, { useState } from 'react';

import {
    bestemMuligeUtdypendeVilkårsvurderingerIBorMedSøkerVilkår,
    useBorMedSøker,
} from './BorMedSøkerContext';
import { useBehandling } from '../../../../../../context/behandlingContext/BehandlingContext';
import type { Regelverk, UtdypendeVilkårsvurdering } from '../../../../../../typer/vilkår';
import { useVilkårEkspanderbarRad } from '../../useVilkårEkspanderbarRad';
import VilkårEkspanderbarRad from '../../VilkårEkspanderbarRad';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useVilkårSkjema } from '../../VilkårSkjemaContext';

type BosattIRiketProps = IVilkårSkjemaBaseProps;

export const BorMedSøker: React.FC<BosattIRiketProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    person,
}: BosattIRiketProps) => {
    const { vurderErLesevisning } = useBehandling();
    const erLesevisning = vurderErLesevisning();

    const { felter } = useBorMedSøker(vilkårResultat, person);
    const vilkårSkjemaContext = useVilkårSkjema(vilkårResultat, felter, person);

    const { toggleForm, ekspandertVilkår } = useVilkårEkspanderbarRad({
        vilkårHarEndringerSomIkkeErLagret: vilkårSkjemaContext.finnesEndringerSomIkkeErLagret,
        lagretVilkårResultat: vilkårResultat,
    });

    const [utdypendeVilkårsvurderinger, setUtdypendeVilkårsvurderinger] = useState<
        UtdypendeVilkårsvurdering[]
    >(bestemMuligeUtdypendeVilkårsvurderingerIBorMedSøkerVilkår(vilkårResultat.vurderesEtter));
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
                        bestemMuligeUtdypendeVilkårsvurderingerIBorMedSøkerVilkår(vurderesEtter)
                    );
                }}
            />
        </VilkårEkspanderbarRad>
    );
};
