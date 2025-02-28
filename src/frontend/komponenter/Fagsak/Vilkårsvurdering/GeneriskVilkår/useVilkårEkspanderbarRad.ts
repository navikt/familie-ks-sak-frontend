import { useEffect, useState } from 'react';

import { useBehandling } from '../../../../context/behandlingContext/BehandlingContext';
import { Resultat, type IVilkårResultat } from '../../../../typer/vilkår';

interface IProps {
    vilkårHarEndringerSomIkkeErLagret: () => boolean;
    lagretVilkårResultat: IVilkårResultat;
}

export const useVilkårEkspanderbarRad = ({
    vilkårHarEndringerSomIkkeErLagret,
    lagretVilkårResultat,
}: IProps) => {
    const { vurderErLesevisning, behandlingPåVent } = useBehandling();
    const erLesevisning = vurderErLesevisning();

    const hentInitiellEkspandering = () =>
        erLesevisning || lagretVilkårResultat.resultat === Resultat.IKKE_VURDERT;

    const [erVilkårEkspandert, settErVilkårEkspandert] = useState(hentInitiellEkspandering());

    useEffect(() => {
        settErVilkårEkspandert(hentInitiellEkspandering());
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
