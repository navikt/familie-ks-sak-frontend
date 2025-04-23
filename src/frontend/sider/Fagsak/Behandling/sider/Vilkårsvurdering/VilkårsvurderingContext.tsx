import React from 'react';

import type { FeiloppsummeringFeil } from '@navikt/familie-skjema';

import { hentFeilIVilkårsvurdering } from '../../../../../context/Vilkårsvurdering/hentFeilIVilkårsvurdering';
import { mapFraRestVilkårsvurderingTilUi } from '../../../../../context/Vilkårsvurdering/vilkårsvurdering';
import type { IBehandling } from '../../../../../typer/behandling';
import type { IPersonResultat, IRestPersonResultat } from '../../../../../typer/vilkår';

interface IProps extends React.PropsWithChildren {
    åpenBehandling: IBehandling;
}

interface VilkårsvurderingContextValue {
    feiloppsummeringFeil: FeiloppsummeringFeil[];
    vilkårsvurdering: IPersonResultat[];
    personResultater: IRestPersonResultat[];
}

const VilkårsvurderingContext = React.createContext<VilkårsvurderingContextValue | undefined>(
    undefined
);

export function VilkårsvurderingProvider({ åpenBehandling, children }: IProps) {
    const vilkårsvurdering = åpenBehandling
        ? mapFraRestVilkårsvurderingTilUi(åpenBehandling.personResultater, åpenBehandling.personer)
        : [];

    const personResultater = åpenBehandling.personResultater;

    const feiloppsummeringFeil: FeiloppsummeringFeil[] =
        hentFeilIVilkårsvurdering(vilkårsvurdering);

    return (
        <VilkårsvurderingContext.Provider
            value={{
                feiloppsummeringFeil,
                vilkårsvurdering,
                personResultater,
            }}
        >
            {children}
        </VilkårsvurderingContext.Provider>
    );
}

export const useVilkårsvurderingContext = () => {
    const context = React.useContext(VilkårsvurderingContext);

    if (context === undefined) {
        throw new Error(
            'useVilkårsvurderingContext må brukes innenfor en VilkårsvurderingProvider'
        );
    }
    return context;
};
