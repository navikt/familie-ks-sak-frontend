import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import {
    type FeiloppsummeringFeil,
    hentFeilIVilkårsvurdering,
} from '@context/Vilkårsvurdering/hentFeilIVilkårsvurdering';
import { useBehandling } from '@hooks/useBehandling';
import type { IPersonResultat } from '@typer/vilkår';

import { mapFraRestVilkårsvurderingTilUi } from './utils';

interface VilkårsvurderingContextValue {
    feiloppsummeringFeil: FeiloppsummeringFeil[];
    vilkårsvurdering: IPersonResultat[];
}

const VilkårsvurderingContext = createContext<VilkårsvurderingContextValue | undefined>(undefined);

export function VilkårsvurderingProvider({ children }: PropsWithChildren) {
    const behandling = useBehandling();

    const value = useMemo<VilkårsvurderingContextValue>(() => {
        const vilkårsvurdering = mapFraRestVilkårsvurderingTilUi(behandling.personResultater, behandling.personer);
        return {
            vilkårsvurdering,
            feiloppsummeringFeil: hentFeilIVilkårsvurdering(vilkårsvurdering),
        };
    }, [behandling]);

    return <VilkårsvurderingContext.Provider value={value}>{children}</VilkårsvurderingContext.Provider>;
}

export function useVilkårsvurderingContext() {
    const context = useContext(VilkårsvurderingContext);

    if (context === undefined) {
        throw new Error('useVilkårsvurderingContext må brukes innenfor en VilkårsvurderingProvider');
    }
    return context;
}
