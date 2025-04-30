import React from 'react';

import {
    bestemMuligeUtdypendeVilkårsvurderingerIBorMedSøkerVilkår,
    useBorMedSøker,
} from './BorMedSøkerContext';
import type { Regelverk } from '../../../../../../../../typer/vilkår';
import { useBehandlingContext } from '../../../../../context/BehandlingContext';
import { useVilkårEkspanderbarRad } from '../../useVilkårEkspanderbarRad';
import { VilkårEkspanderbarRad } from '../../VilkårEkspanderbarRad';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';

type BosattIRiketProps = IVilkårSkjemaBaseProps;

export const BorMedSøker: React.FC<BosattIRiketProps> = ({
    lagretVilkårResultat,
    vilkårFraConfig,
    person,
    settFokusPåLeggTilPeriodeKnapp,
}: BosattIRiketProps) => {
    const { vurderErLesevisning } = useBehandlingContext();
    const erLesevisning = vurderErLesevisning();

    const {
        vilkårSkjemaContext,
        finnesEndringerSomIkkeErLagret,
        muligeUtdypendeVilkårsvurderinger,
        settMuligeUtdypendeVilkårsvurderinger,
    } = useBorMedSøker(lagretVilkårResultat, person);

    const { toggleForm, erVilkårEkspandert } = useVilkårEkspanderbarRad({
        vilkårHarEndringerSomIkkeErLagret: finnesEndringerSomIkkeErLagret,
        lagretVilkårResultat: lagretVilkårResultat,
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
                        bestemMuligeUtdypendeVilkårsvurderingerIBorMedSøkerVilkår(vurderesEtter)
                    );
                }}
            />
        </VilkårEkspanderbarRad>
    );
};
