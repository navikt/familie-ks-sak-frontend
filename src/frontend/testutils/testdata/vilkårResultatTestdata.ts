import { type IRestVilkårResultat, type IVilkårResultat, Resultat, VilkårType } from '@typer/vilkår';

export function lagVilkårResultat(vilkårResultat: Partial<IRestVilkårResultat>): IRestVilkårResultat {
    return {
        begrunnelse: 'begrunnelse',
        behandlingId: 1,
        endretAv: '',
        endretTidspunkt: '',
        erAutomatiskVurdert: false,
        erVurdert: false,
        id: 1,
        periodeFom: undefined,
        periodeTom: undefined,
        resultat: Resultat.IKKE_VURDERT,
        erEksplisittAvslagPåSøknad: undefined,
        avslagBegrunnelser: [],
        vilkårType: VilkårType.BOR_MED_SØKER,
        vurderesEtter: undefined,
        utdypendeVilkårsvurderinger: [],
        antallTimer: undefined,
        søkerHarMeldtFraOmBarnehageplass: undefined,
        ...vilkårResultat,
    };
}

export function lagVilkårResultatUi(vilkårResultat: Partial<IRestVilkårResultat> = {}): IVilkårResultat {
    const { periodeFom, periodeTom, ...rest } = lagVilkårResultat(vilkårResultat);
    // Bygger perioden direkte i stedet for med nyIsoDatoPeriode, fordi @utils/dato ikke kan importeres i Playwright.
    return { ...rest, periode: { fom: periodeFom || undefined, tom: periodeTom || undefined } };
}

export * as VilkårResultatTestdata from './vilkårResultatTestdata';
