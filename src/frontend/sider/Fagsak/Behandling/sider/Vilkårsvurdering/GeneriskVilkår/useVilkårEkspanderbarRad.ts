import { useEffect, useState } from 'react';

import { type IVilkårResultat, Resultat } from '../../../../../../typer/vilkår';
import { useBehandlingContext } from '../../../context/BehandlingContext';

interface IProps {
    vilkårHarEndringerSomIkkeErLagret: () => boolean;
    lagretVilkårResultat: IVilkårResultat;
}

export const useVilkårEkspanderbarRad = ({ vilkårHarEndringerSomIkkeErLagret, lagretVilkårResultat }: IProps) => {
    const { vurderErLesevisning, behandlingPåVent } = useBehandlingContext();
    const erLesevisning = vurderErLesevisning();

    const initiellEkspandering = erLesevisning || lagretVilkårResultat.resultat === Resultat.IKKE_VURDERT;

    const [erVilkårEkspandert, settErVilkårEkspandert] = useState(initiellEkspandering);

    useEffect(() => {
        settErVilkårEkspandert(initiellEkspandering);
    }, [behandlingPåVent]);

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
