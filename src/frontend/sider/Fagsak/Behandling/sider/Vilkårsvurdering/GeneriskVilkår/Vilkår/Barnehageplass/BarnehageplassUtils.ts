import {
    type IVilkårResultat,
    Resultat,
    type UtdypendeVilkårsvurdering,
    UtdypendeVilkårsvurderingGenerell,
} from '@typer/vilkår';

const antallTimerKvalifiserer = (antallTimer: number) => antallTimer > 0 && antallTimer < 33;

const vilkårIkkeOppfyltOgUtdypendeIkkeSommerferie = (
    resultat: Resultat,
    utdypendeVilkårsvurdering: UtdypendeVilkårsvurdering[]
) =>
    resultat === Resultat.IKKE_OPPFYLT &&
    !utdypendeVilkårsvurdering.includes(UtdypendeVilkårsvurderingGenerell.SOMMERFERIE);

const vilkårOppfyltOgAntallTimerKvalifiserer = (resultat: Resultat, antallTimer: string) =>
    resultat === Resultat.OPPFYLT && antallTimerKvalifiserer(Number(antallTimer));

export function utledHarBarnehageplass(vilkårResultat: IVilkårResultat): boolean | null {
    if (vilkårResultat.resultat === Resultat.IKKE_VURDERT) {
        return null;
    }
    return (
        vilkårIkkeOppfyltOgUtdypendeIkkeSommerferie(
            vilkårResultat.resultat,
            vilkårResultat.utdypendeVilkårsvurderinger
        ) ||
        vilkårOppfyltOgAntallTimerKvalifiserer(vilkårResultat.resultat, vilkårResultat.antallTimer?.toString() ?? '')
    );
}

export function utledBarnehageplassResultat(
    harBarnehageplass: boolean | null,
    antallTimer: string,
    utdypendeVilkårsvurderinger: UtdypendeVilkårsvurdering[]
): Resultat {
    if (harBarnehageplass === null) {
        return Resultat.IKKE_VURDERT;
    }
    if (!harBarnehageplass) {
        return utdypendeVilkårsvurderinger.includes(UtdypendeVilkårsvurderingGenerell.SOMMERFERIE)
            ? Resultat.IKKE_OPPFYLT
            : Resultat.OPPFYLT;
    }
    return antallTimerKvalifiserer(Number(antallTimer)) ? Resultat.OPPFYLT : Resultat.IKKE_OPPFYLT;
}
