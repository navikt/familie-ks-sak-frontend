import {
    Resultat,
    UtdypendeVilkårsvurderingGenerell,
    type UtdypendeVilkårsvurdering,
} from '../../../../../../typer/vilkår';

export const antallTimerKvalifiserer = (antallTimer: number) => antallTimer > 0 && antallTimer < 33;

export const vilkårIkkeOppfyltOgUtdypendeIkkeSommerferie = (
    resultat: Resultat,
    utdypendeVilkårsvurdering: UtdypendeVilkårsvurdering[]
) =>
    resultat === Resultat.IKKE_OPPFYLT &&
    !utdypendeVilkårsvurdering.find(
        utdypende => utdypende === UtdypendeVilkårsvurderingGenerell.SOMMERFERIE
    );

export const vilkårOppfyltOgAntallTimerKvalifiserer = (resultat: Resultat, antallTimer: string) =>
    resultat === Resultat.OPPFYLT && antallTimerKvalifiserer(Number(antallTimer));
