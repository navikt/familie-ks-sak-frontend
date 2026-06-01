import { createContext, type PropsWithChildren, useContext } from 'react';

import { hentFeilIVilkårsvurdering } from '@context/Vilkårsvurdering/hentFeilIVilkårsvurdering';
import { useBehandling } from '@hooks/useBehandling';
import type { IPersonResultat, IRestPersonResultat } from '@typer/vilkår';

import type { FeiloppsummeringFeil } from '@navikt/familie-skjema';

import { mapFraRestVilkårsvurderingTilUi } from './utils';

interface VilkårsvurderingContextValue {
    feiloppsummeringFeil: FeiloppsummeringFeil[];
    vilkårsvurdering: IPersonResultat[];
    personResultater: IRestPersonResultat[];
}

const VilkårsvurderingContext = createContext<VilkårsvurderingContextValue | undefined>(undefined);

export function VilkårsvurderingProvider({ children }: PropsWithChildren) {
    const behandling = useBehandling();

    const vilkårsvurdering = behandling
        ? mapFraRestVilkårsvurderingTilUi(behandling.personResultater, behandling.personer)
        : [];

    const personResultater = behandling.personResultater;

    const feiloppsummeringFeil: FeiloppsummeringFeil[] = hentFeilIVilkårsvurdering(vilkårsvurdering);

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
    const context = useContext(VilkårsvurderingContext);

    if (context === undefined) {
        throw new Error('useVilkårsvurderingContext må brukes innenfor en VilkårsvurderingProvider');
    }
    return context;
};
