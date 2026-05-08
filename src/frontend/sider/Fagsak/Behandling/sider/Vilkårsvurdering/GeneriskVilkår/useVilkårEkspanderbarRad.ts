import { useEffect, useState } from 'react';

import { useBehandling } from '@hooks/useBehandling';
import { useErLesevisning } from '@hooks/useErLesevisning';
import { type IVilkårResultat, Resultat } from '@typer/vilkår';

interface IProps {
    vilkårHarEndringerSomIkkeErLagret: () => boolean;
    lagretVilkårResultat: IVilkårResultat;
}

export const useVilkårEkspanderbarRad = ({ vilkårHarEndringerSomIkkeErLagret, lagretVilkårResultat }: IProps) => {
    const behandling = useBehandling();
    const erLesevisning = useErLesevisning();

    const initiellEkspandering = erLesevisning || lagretVilkårResultat.resultat === Resultat.IKKE_VURDERT;
    const [erVilkårEkspandert, settErVilkårEkspandert] = useState(initiellEkspandering);

    useEffect(() => {
        settErVilkårEkspandert(initiellEkspandering);
    }, [behandling.behandlingPåVent]);

    const toggleForm = (visAlert: boolean) => {
        if (erVilkårEkspandert && visAlert && vilkårHarEndringerSomIkkeErLagret()) {
            alert('Vurderingen har endringer som ikke er lagret!');
        } else {
            settErVilkårEkspandert(!erVilkårEkspandert);
        }
    };

    return {
        erVilkårEkspandert,
        toggleForm,
    };
};
