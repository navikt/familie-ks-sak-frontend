import React from 'react';

import {
    bestemMuligeUtdypendeVilkårsvurderingerIBosattIRiketVilkår,
    useBosattIRiket,
} from './BosattIRiketContext';
import { useBehandling } from '../../../../../../../context/behandlingContext/BehandlingContext';
import type { Regelverk } from '../../../../../../../typer/vilkår';
import { useVilkårEkspanderbarRad } from '../../useVilkårEkspanderbarRad';
import { VilkårEkspanderbarRad } from '../../VilkårEkspanderbarRad';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';

type BosattIRiketProps = IVilkårSkjemaBaseProps;

export const BosattIRiket: React.FC<BosattIRiketProps> = ({
    lagretVilkårResultat,
    vilkårFraConfig,
    person,
    settFokusPåLeggTilPeriodeKnapp,
}: BosattIRiketProps) => {
    const { vurderErLesevisning } = useBehandling();
    const erLesevisning = vurderErLesevisning();

    const {
        vilkårSkjemaContext,
        finnesEndringerSomIkkeErLagret,
        muligeUtdypendeVilkårsvurderinger,
        settMuligeUtdypendeVilkårsvurderinger,
    } = useBosattIRiket(lagretVilkårResultat, person);

    const { toggleForm, erVilkårEkspandert } = useVilkårEkspanderbarRad({
        vilkårHarEndringerSomIkkeErLagret: finnesEndringerSomIkkeErLagret,
        lagretVilkårResultat,
    });

    return (
        <VilkårEkspanderbarRad
            lagretVilkårResultat={lagretVilkårResultat}
            erVilkårEkspandert={erVilkårEkspandert}
            toggleForm={toggleForm}
        >
            <VilkårSkjema
                vilkårSkjemaContext={vilkårSkjemaContext}
                visVurderesEtter={true}
                visSpørsmål={true}
                muligeUtdypendeVilkårsvurderinger={muligeUtdypendeVilkårsvurderinger}
                lagretVilkårResultat={lagretVilkårResultat}
                vilkårFraConfig={vilkårFraConfig}
                toggleForm={toggleForm}
                person={person}
                lesevisning={erLesevisning}
                settFokusPåLeggTilPeriodeKnapp={settFokusPåLeggTilPeriodeKnapp}
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
