import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

import { useBehandling } from '@hooks/useBehandling';
import { useErLesevisning } from '@hooks/useErLesevisning';
import { Resultat } from '@typer/vilkår';

function useInitielleEkspanderteIdenter(): Set<string> {
    const behandling = useBehandling();
    const erLesevisning = useErLesevisning();

    if (erLesevisning) {
        return new Set(behandling.personResultater.map(pr => pr.personIdent));
    }

    const identer = new Set<string>();

    behandling.personResultater.forEach(pr => {
        const harIkkeVurdert = pr.vilkårResultater
            .map(pr => pr.resultat)
            .some(resultat => resultat === Resultat.IKKE_VURDERT);

        if (harIkkeVurdert) {
            identer.add(pr.personIdent);
        }
    });

    return identer;
}

interface EkspanderbareVilkårsvurderingPanelerContext {
    erPanelEkspandert: (ident: string) => boolean;
    ekspanderPanel: (ident: string) => void;
    kollapsPanel: (ident: string) => void;
    togglePanel: (ident: string) => void;
}

const Context = createContext<EkspanderbareVilkårsvurderingPanelerContext | undefined>(undefined);

export function EkspanderbareVilkårsvurderingPanelerProvider({ children }: PropsWithChildren) {
    const initielleEkspanderteIdenter = useInitielleEkspanderteIdenter();

    const [ekspanderteIdenter, settEkspanderteIdenter] = useState<Set<string>>(initielleEkspanderteIdenter);

    const erPanelEkspandert = useCallback((ident: string) => ekspanderteIdenter.has(ident), [ekspanderteIdenter]);

    const ekspanderPanel = useCallback((ident: string) => {
        settEkspanderteIdenter(forrige => {
            const neste = new Set(forrige);
            neste.add(ident);
            return neste;
        });
    }, []);

    const kollapsPanel = useCallback((ident: string) => {
        settEkspanderteIdenter(forrige => {
            const neste = new Set(forrige);
            neste.delete(ident);
            return neste;
        });
    }, []);

    const togglePanel = useCallback((ident: string) => {
        settEkspanderteIdenter(forrige => {
            const neste = new Set(forrige);
            if (neste.has(ident)) {
                neste.delete(ident);
            } else {
                neste.add(ident);
            }
            return neste;
        });
    }, []);

    const value = useMemo(
        () => ({ erPanelEkspandert, ekspanderPanel, kollapsPanel, togglePanel }),
        [erPanelEkspandert, ekspanderPanel, kollapsPanel, togglePanel]
    );

    return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useEkspanderbareVilkårsvurderingPaneler() {
    const context = useContext(Context);
    if (context === undefined) {
        throw new Error(
            'useEkspanderbareVilkårsvurderingPaneler må brukes innenfor en EkspanderbareVilkårsvurderingPanelerProvider.'
        );
    }
    return context;
}
