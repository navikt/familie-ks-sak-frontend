import { useErLesevisning } from '@hooks/useErLesevisning';
import type { Regelverk } from '@typer/vilkår';

import { bestemMuligeUtdypendeVilkårsvurderingerIBorMedSøkerVilkår, useBorMedSøker } from './BorMedSøkerContext';
import { useVilkårEkspanderbarRad } from '../../useVilkårEkspanderbarRad';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { VilkårTabellRad } from '../../VilkårTabellRad';

type BosattIRiketProps = IVilkårSkjemaBaseProps;

export const BorMedSøker = ({
    lagretVilkårResultat,
    vilkårFraConfig,
    person,
    settFokusPåLeggTilPeriodeKnapp,
}: BosattIRiketProps) => {
    const erLesevisning = useErLesevisning();

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
        <VilkårTabellRad
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
        </VilkårTabellRad>
    );
};
