import React from 'react';

import {
    bestemMuligeUtdypendeVilkårsvurderingerIBosattIRiketVilkår,
    useBosattIRiket,
} from './BosattIRiketContext';
import { useBehandling } from '../../../../../../context/behandlingContext/BehandlingContext';
import type { Regelverk } from '../../../../../../typer/vilkår';
import { useVilkårEkspanderbarRad } from '../../useVilkårEkspanderbarRad';
import VilkårEkspanderbarRad from '../../VilkårEkspanderbarRad';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';

type BosattIRiketProps = IVilkårSkjemaBaseProps;

export const BosattIRiket: React.FC<BosattIRiketProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    person,
}: BosattIRiketProps) => {
    const { vurderErLesevisning } = useBehandling();
    const erLesevisning = vurderErLesevisning();

    const {
        vilkårSkjemaContext,
        finnesEndringerSomIkkeErLagret,
        muligeUtdypendeVilkårsvurderinger,
        settMuligeUtdypendeVilkårsvurderinger,
    } = useBosattIRiket(vilkårResultat, person);

    const { toggleForm, ekspandertVilkår } = useVilkårEkspanderbarRad({
        vilkårHarEndringerSomIkkeErLagret: finnesEndringerSomIkkeErLagret,
        lagretVilkårResultat: vilkårResultat,
    });

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
