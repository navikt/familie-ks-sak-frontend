import { useEffect } from 'react';

import { useFelt } from '@navikt/familie-skjema';

import {
    erAntallTimerGyldig,
    erUtdypendeVilkårsvurderingerGyldig,
} from './BarnehageplassValidering';
import type { IGrunnlagPerson } from '../../../../../../typer/person';
import type { Begrunnelse } from '../../../../../../typer/vedtak';
import { UtdypendeVilkårsvurderingGenerell, VilkårType } from '../../../../../../typer/vilkår';
import type { UtdypendeVilkårsvurdering } from '../../../../../../typer/vilkår';
import type { IVilkårResultat } from '../../../../../../typer/vilkår';
import type { Regelverk as RegelverkType, Resultat } from '../../../../../../typer/vilkår';
import type { IIsoDatoPeriode } from '../../../../../../utils/dato';
import {
    erAvslagBegrunnelserGyldig,
    erPeriodeGyldig,
    erResultatGyldig,
} from '../../../../../../utils/validators';
import type { IVilkårSkjemaContext } from '../../VilkårSkjemaContext';

export const muligeUtdypendeVilkårsvurderinger: UtdypendeVilkårsvurdering[] = [
    UtdypendeVilkårsvurderingGenerell.SOMMERFERIE,
];

export interface IBarnehageplassVilkårSkjemaContext extends IVilkårSkjemaContext {
    antallTimer: string;
    søkerHarMeldtFraOmBarnehageplass: boolean;
}

export const useBarnehageplass = (vilkår: IVilkårResultat, person: IGrunnlagPerson) => {
    const vilkårSkjema: IBarnehageplassVilkårSkjemaContext = {
        vurderesEtter: vilkår.vurderesEtter ? vilkår.vurderesEtter : undefined,
        resultat: vilkår.resultat,
        antallTimer: vilkår.antallTimer ? vilkår.antallTimer.toString() : '',
        utdypendeVilkårsvurdering: vilkår.utdypendeVilkårsvurderinger,
        periode: vilkår.periode,
        søkerHarMeldtFraOmBarnehageplass: vilkår.søkerHarMeldtFraOmBarnehageplass ?? false,
        begrunnelse: vilkår.begrunnelse,
        erEksplisittAvslagPåSøknad: vilkår.erEksplisittAvslagPåSøknad ?? false,
        avslagBegrunnelser: vilkår.avslagBegrunnelser,
    };

    const vurderesEtter = useFelt<RegelverkType | undefined>({
        verdi: vilkårSkjema.vurderesEtter,
    });

    const resultat = useFelt<Resultat>({
        verdi: vilkårSkjema.resultat,
        valideringsfunksjon: erResultatGyldig,
    });

    const erEksplisittAvslagPåSøknad = useFelt<boolean>({
        verdi: vilkårSkjema.erEksplisittAvslagPåSøknad,
    });

    const utdypendeVilkårsvurdering = useFelt<UtdypendeVilkårsvurdering[]>({
        verdi: vilkårSkjema.utdypendeVilkårsvurdering,
        valideringsfunksjon: erUtdypendeVilkårsvurderingerGyldig,
    });

    const søkerHarMeldtFraOmBarnehageplass = useFelt<boolean>({
        verdi: vilkårSkjema.søkerHarMeldtFraOmBarnehageplass,
    });

    const periode = useFelt<IIsoDatoPeriode>({
        verdi: vilkårSkjema.periode,
        avhengigheter: {
            person,
            erEksplisittAvslagPåSøknad: erEksplisittAvslagPåSøknad.verdi,
            søkerHarMeldtFraOmBarnehageplass: søkerHarMeldtFraOmBarnehageplass.verdi,
        },
        valideringsfunksjon: (felt, avhengigheter) =>
            erPeriodeGyldig(felt, VilkårType.BARNEHAGEPLASS, avhengigheter),
    });

    const felter = {
        vurderesEtter,
        resultat,
        antallTimer: useFelt<string>({
            verdi: vilkårSkjema.antallTimer,
            avhengigheter: {
                resultat: resultat.verdi,
                utdypendeVilkårsvurdering: utdypendeVilkårsvurdering.verdi,
            },
            valideringsfunksjon: erAntallTimerGyldig,
        }),
        utdypendeVilkårsvurdering,
        periode,
        søkerHarMeldtFraOmBarnehageplass,
        begrunnelse: useFelt<string>({
            verdi: vilkårSkjema.begrunnelse,
        }),
        erEksplisittAvslagPåSøknad,
        avslagBegrunnelser: useFelt<Begrunnelse[]>({
            verdi: vilkårSkjema.avslagBegrunnelser,
            valideringsfunksjon: erAvslagBegrunnelserGyldig,
            avhengigheter: {
                erEksplisittAvslagPåSøknad: erEksplisittAvslagPåSøknad.verdi,
            },
        }),
    };

    useEffect(() => {
        if (!periode.verdi.tom) {
            søkerHarMeldtFraOmBarnehageplass.validerOgSettFelt(false);
        }
    }, [periode.verdi.tom]);

    return {
        felter,
    };
};
