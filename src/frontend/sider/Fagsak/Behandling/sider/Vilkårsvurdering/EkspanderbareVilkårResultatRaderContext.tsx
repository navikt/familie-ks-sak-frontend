import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

import { useBehandling } from '@hooks/useBehandling';
import { useErLesevisning } from '@hooks/useErLesevisning';
import type { IBehandling } from '@typer/behandling';
import { Resultat } from '@typer/vilkår';

function finnInitielleEkspanderteIder(behandling: IBehandling, erLesevisning: boolean): Set<number> {
    const vilkårResultater = behandling.personResultater.flatMap(it => it.vilkårResultater);

    if (erLesevisning) {
        const initielleIder = vilkårResultater.map(it => it.id);
        return new Set(initielleIder);
    }

    const vilkårResultatSomIkkeErVurdert = vilkårResultater
        .filter(it => it.resultat === Resultat.IKKE_VURDERT)
        .map(it => it.id);

    return new Set(vilkårResultatSomIkkeErVurdert);
}

interface EkspanderbareVilkårResultatRaderContext {
    erRadEkspandert: (id: number) => boolean;
    ekspanderRad: (id: number, isDirty?: boolean) => void;
    kollapsRad: (id: number, isDirty?: boolean) => void;
    toggleRad: (id: number, isDirty?: boolean) => void;
}

const Context = createContext<EkspanderbareVilkårResultatRaderContext | undefined>(undefined);

export function EkspanderbareVilkårResultatRaderProvider({ children }: PropsWithChildren) {
    const behandling = useBehandling();
    const erLesevisning = useErLesevisning();

    const [ekspanderteIder, settEkspanderteIder] = useState(() =>
        finnInitielleEkspanderteIder(behandling, erLesevisning)
    );

    const erRadEkspandert = useCallback(
        (id: number) => {
            return ekspanderteIder.has(id);
        },
        [ekspanderteIder]
    );

    const ekspanderRad = useCallback((id: number, isDirty: boolean = false) => {
        if (isDirty) {
            alert('Vurderingen har endringer som ikke er lagret!');
            return;
        }
        settEkspanderteIder(forrige => {
            const neste = new Set(forrige);
            neste.add(id);
            return neste;
        });
    }, []);

    const kollapsRad = useCallback(
        (id: number, isDirty: boolean = false) => {
            if (erRadEkspandert(id) && isDirty) {
                alert('Vurderingen har endringer som ikke er lagret!');
                return;
            }
            settEkspanderteIder(forrige => {
                const neste = new Set(forrige);
                neste.delete(id);
                return neste;
            });
        },
        [erRadEkspandert]
    );

    const toggleRad = useCallback(
        (id: number, isDirty: boolean = false) => {
            if (erRadEkspandert(id) && isDirty) {
                alert('Vurderingen har endringer som ikke er lagret!');
                return;
            }
            settEkspanderteIder(forrige => {
                const neste = new Set(forrige);
                if (neste.has(id)) {
                    neste.delete(id);
                } else {
                    neste.add(id);
                }
                return neste;
            });
        },
        [erRadEkspandert]
    );

    const value = useMemo(
        () => ({
            erRadEkspandert,
            ekspanderRad,
            kollapsRad,
            toggleRad,
        }),
        [erRadEkspandert, ekspanderRad, kollapsRad, toggleRad]
    );

    return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useEkspanderbareVilkårResultatRader() {
    const context = useContext(Context);
    if (context === undefined) {
        throw new Error('useVilkårResultatPaneler må brukes innenfor en VilkårResultatPanelerProvider.');
    }
    return context;
}

export function useEkspanderbarVilkårResultatRad(id: number) {
    const { erRadEkspandert, ekspanderRad, kollapsRad, toggleRad } = useEkspanderbareVilkårResultatRader();

    const ekspandert = erRadEkspandert(id);
    const ekspander = useCallback((isDirty: boolean = false) => ekspanderRad(id, isDirty), [ekspanderRad, id]);
    const kollaps = useCallback((isDirty: boolean = false) => kollapsRad(id, isDirty), [kollapsRad, id]);
    const toggle = useCallback((isDirty: boolean = false) => toggleRad(id, isDirty), [toggleRad, id]);

    return useMemo(
        () => ({
            erRadEkspandert: ekspandert,
            ekspanderRad: ekspander,
            kollapsRad: kollaps,
            toggleRad: toggle,
        }),
        [ekspandert, ekspander, kollaps, toggle]
    );
}
