import React from 'react';

import { Resultat } from '../../../../../../typer/vilkår';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useVilkårSkjema } from '../../VilkårSkjemaContext';
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
    const vilkårSkjemaContext = useVilkårSkjema(vilkårResultat, felter, person, toggleForm);
    return (
        <VilkårSkjema
            vilkårSkjemaContext={vilkårSkjemaContext}
            visVurderesEtter={false}
            vilkårResultat={vilkårResultat}
            vilkårFraConfig={vilkårFraConfig}
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
