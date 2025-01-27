import React from 'react';

import StatusIkon, { Status } from './StatusIkon';
import { Resultat } from '../typer/vilkår';

interface IVilkårResultatIkon {
    height?: number;
    resultat: Resultat;
    width?: number;
}

const VilkårResultatIkon: React.FC<IVilkårResultatIkon> = ({ resultat }) => {
    switch (resultat) {
        case Resultat.OPPFYLT:
            return <StatusIkon status={Status.OK} />;
        case Resultat.IKKE_OPPFYLT:
            return <StatusIkon status={Status.FEIL} />;
        case Resultat.IKKE_VURDERT:
            return <StatusIkon status={Status.ADVARSEL} />;
        case Resultat.IKKE_AKTUELT:
            return <StatusIkon status={Status.INFO} />;
    }
};

export default VilkårResultatIkon;
