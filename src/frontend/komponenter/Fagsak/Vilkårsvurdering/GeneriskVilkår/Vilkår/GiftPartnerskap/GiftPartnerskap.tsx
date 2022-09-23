import React from 'react';

import { Resultat } from '../../../../../../typer/vilkår';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useGiftPartnerskap } from './GiftPartnerskapContext';

type BosattIRiketProps = IVilkårSkjemaBaseProps;

export const GiftPartnerskap: React.FC<BosattIRiketProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    toggleForm,
    person,
    lesevisning,
}: BosattIRiketProps) => {
    const { felter } = useGiftPartnerskap(vilkårResultat, person);
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
