import React from 'react';

import { Resultat } from '../../../../../../typer/vilkår';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useMedlemskap } from './MedlemskapContext';

type MedlemskapProps = IVilkårSkjemaBaseProps;

export const Medlemskap: React.FC<MedlemskapProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    toggleForm,
    person,
    lesevisning,
}: MedlemskapProps) => {
    const { felter } = useMedlemskap(vilkårResultat, person);
    return (
        <VilkårSkjema
            visVurderesEtter={false}
            vilkårResultat={vilkårResultat}
            vilkårFraConfig={vilkårFraConfig}
            felter={felter}
            toggleForm={toggleForm}
            person={person}
            lesevisning={lesevisning}
            onResultatJa={() => Resultat.IKKE_OPPFYLT}
            resultatJaChecked={resultat => resultat === Resultat.IKKE_OPPFYLT}
            onResultatNei={() => Resultat.OPPFYLT}
            resultatNeiChecked={resultat => resultat === Resultat.OPPFYLT}
        />
    );
};
