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

type BosattIRiketProps = IVilkårSkjemaBaseProps;

export const BorMedSøker: React.FC<BosattIRiketProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    person,
}: BosattIRiketProps) => {
    const { vurderErLesevisning } = useBehandling();
    const erLesevisning = vurderErLesevisning();

    const { vilkårSkjemaContext, finnesEndringerSomIkkeErLagret } = useBorMedSøker(
        vilkårResultat,
        person
    );

    const { toggleForm, ekspandertVilkår } = useVilkårEkspanderbarRad({
        vilkårHarEndringerSomIkkeErLagret: finnesEndringerSomIkkeErLagret,
        lagretVilkårResultat: vilkårResultat,
    });

    const [muligeUtdypendeVilkårsvurderinger, settMuligeUtdypendeVilkårsvurderinger] = useState<
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
                muligeUtdypendeVilkårsvurderinger={muligeUtdypendeVilkårsvurderinger}
                vilkårResultat={vilkårResultat}
                vilkårFraConfig={vilkårFraConfig}
                toggleForm={toggleForm}
                person={person}
                lesevisning={erLesevisning}
                oppdaterMuligeUtdypendeVilkårsvurderinger={(vurderesEtter: Regelverk): void => {
                    settMuligeUtdypendeVilkårsvurderinger(
                        bestemMuligeUtdypendeVilkårsvurderingerIBorMedSøkerVilkår(vurderesEtter)
                    );
                }}
            />
        </VilkårEkspanderbarRad>
    );
};
