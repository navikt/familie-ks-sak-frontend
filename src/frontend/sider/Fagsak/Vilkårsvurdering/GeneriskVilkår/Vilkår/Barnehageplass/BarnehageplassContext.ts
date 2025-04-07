import { useEffect, useState } from 'react';

import { useFelt } from '@navikt/familie-skjema';

import {
    vilkårIkkeOppfyltOgUtdypendeIkkeSommerferie,
    vilkårOppfyltOgAntallTimerKvalifiserer,
} from './BarnehageplassUtils';
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
    erBegrunnelseGyldig,
    erPeriodeGyldig,
    erResultatGyldig,
} from '../../../../../../utils/validators';
import { useVilkårSkjema, type IVilkårSkjemaContext } from '../../VilkårSkjemaContext';

export const muligeUtdypendeVilkårsvurderinger: UtdypendeVilkårsvurdering[] = [
    UtdypendeVilkårsvurderingGenerell.SOMMERFERIE,
];

export interface BarnehageplassVilkårSkjemaContext extends IVilkårSkjemaContext {
    antallTimer: string;
    søkerHarMeldtFraOmBarnehageplass: boolean;
}

export const useBarnehageplass = (lagretVilkår: IVilkårResultat, person: IGrunnlagPerson) => {
    const vilkårSkjemaMedLagredeVerdier: BarnehageplassVilkårSkjemaContext = {
        vurderesEtter: lagretVilkår.vurderesEtter ?? undefined,
        resultat: lagretVilkår.resultat,
        antallTimer: lagretVilkår.antallTimer ? lagretVilkår.antallTimer.toString() : '',
        utdypendeVilkårsvurdering: lagretVilkår.utdypendeVilkårsvurderinger,
        periode: lagretVilkår.periode,
        søkerHarMeldtFraOmBarnehageplass: lagretVilkår.søkerHarMeldtFraOmBarnehageplass ?? false,
        begrunnelse: lagretVilkår.begrunnelse,
        erEksplisittAvslagPåSøknad: lagretVilkår.erEksplisittAvslagPåSøknad ?? false,
        avslagBegrunnelser: lagretVilkår.avslagBegrunnelser,
    };

    const vurderesEtter = useFelt<RegelverkType | undefined>({
        verdi: vilkårSkjemaMedLagredeVerdier.vurderesEtter,
    });

    const resultat = useFelt<Resultat>({
        verdi: vilkårSkjemaMedLagredeVerdier.resultat,
        valideringsfunksjon: erResultatGyldig,
    });

    const erEksplisittAvslagPåSøknad = useFelt<boolean>({
        verdi: vilkårSkjemaMedLagredeVerdier.erEksplisittAvslagPåSøknad,
    });

    const utdypendeVilkårsvurdering = useFelt<UtdypendeVilkårsvurdering[]>({
        verdi: vilkårSkjemaMedLagredeVerdier.utdypendeVilkårsvurdering,
        valideringsfunksjon: erUtdypendeVilkårsvurderingerGyldig,
    });

    const søkerHarMeldtFraOmBarnehageplass = useFelt<boolean>({
        verdi: vilkårSkjemaMedLagredeVerdier.søkerHarMeldtFraOmBarnehageplass,
    });

    const periode = useFelt<IIsoDatoPeriode>({
        verdi: vilkårSkjemaMedLagredeVerdier.periode,
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
            verdi: vilkårSkjemaMedLagredeVerdier.antallTimer,
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
            verdi: vilkårSkjemaMedLagredeVerdier.begrunnelse,
            valideringsfunksjon: erBegrunnelseGyldig,
            avhengigheter: {
                søkerHarMeldtFraOmBarnehageplass: søkerHarMeldtFraOmBarnehageplass.verdi,
                vilkårType: VilkårType.BARNEHAGEPLASS,
            },
        }),
        erEksplisittAvslagPåSøknad,
        avslagBegrunnelser: useFelt<Begrunnelse[]>({
            verdi: vilkårSkjemaMedLagredeVerdier.avslagBegrunnelser,
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

    const {
        skjema,
        lagreVilkår,
        lagrerVilkår,
        slettVilkår,
        sletterVilkår,
        feilmelding,
        nullstillSkjema,
        finnesEndringerSomIkkeErLagret,
    } = useVilkårSkjema(lagretVilkår, felter, person);

    const initiellHarBarnehageplass =
        vilkårIkkeOppfyltOgUtdypendeIkkeSommerferie(
            vilkårSkjemaMedLagredeVerdier.resultat,
            vilkårSkjemaMedLagredeVerdier.utdypendeVilkårsvurdering
        ) ||
        vilkårOppfyltOgAntallTimerKvalifiserer(
            vilkårSkjemaMedLagredeVerdier.resultat,
            vilkårSkjemaMedLagredeVerdier.antallTimer
        );

    const [harBarnehageplass, settHarBarnehageplass] = useState(initiellHarBarnehageplass);

    return {
        vilkårSkjemaContext: {
            skjema,
            lagreVilkår,
            lagrerVilkår,
            slettVilkår,
            sletterVilkår,
            feilmelding,
            nullstillSkjema: () => {
                nullstillSkjema();
                settHarBarnehageplass(initiellHarBarnehageplass);
            },
        },
        finnesEndringerSomIkkeErLagret: () =>
            finnesEndringerSomIkkeErLagret(vilkårSkjemaMedLagredeVerdier),
        harBarnehageplass,
        settHarBarnehageplass,
    };
};
