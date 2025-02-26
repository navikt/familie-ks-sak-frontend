import { useEffect, useState } from 'react';

import { useBehandling } from '../../../../context/behandlingContext/BehandlingContext';
import { Resultat, type IVilkårResultat } from '../../../../typer/vilkår';

export const useVilkårTabell = (erVilkårEndret: () => boolean, vilkårResultat: IVilkårResultat) => {
    const { vurderErLesevisning, behandlingPåVent } = useBehandling();
    const erLesevisning = vurderErLesevisning();

    const hentInitiellEkspandering = () =>
        erLesevisning || vilkårResultat.resultat === Resultat.IKKE_VURDERT;

    const [ekspandertVilkår, settEkspandertVilkår] = useState(hentInitiellEkspandering());

    useEffect(() => {
        settEkspandertVilkår(hentInitiellEkspandering());
    }, [behandlingPåVent]);

    const toggleForm = (visAlert: boolean) => {
        if (ekspandertVilkår && visAlert && erVilkårEndret()) {
            alert('Vurderingen har endringer som ikke er lagret!');
        } else {
            settEkspandertVilkår(!ekspandertVilkår);
        }
    };

    return {
        ekspandertVilkår,
        toggleForm,
    };
};
