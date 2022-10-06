import type {
    IRestAnnenVurdering,
    IRestPersonResultat,
    IRestVilkårResultat,
} from '../../../typer/vilkår';
import { Regelverk, Resultat, VilkårType } from '../../../typer/vilkår';
import { erIkkeGenereltVilkår } from '../../vilkår';

interface IMockRestPersonResultat {
    personIdent?: string;
    vilkårResultater?: IRestVilkårResultat[];
    andreVurderinger?: IRestAnnenVurdering[];
}

interface IRestResultaterMock {
    behandlingId?: number;
    id?: number;
    resultat?: Resultat;
    vilkårType?: VilkårType;
    periodeFom?: string;
    periodeTom?: string;
    vurderesEtter?: Regelverk;
}

export const mockRestVilkårResultat = ({
    id = 1,
    resultat = Resultat.OPPFYLT,
    behandlingId = 1,
    vilkårType = VilkårType.MEDLEMSKAP,
    periodeFom = '2000-01-01',
    periodeTom = undefined,
    vurderesEtter = Regelverk.NASJONALE_REGLER,
}: IRestResultaterMock = {}): IRestVilkårResultat => ({
    id,
    vilkårType,
    resultat,
    periodeFom,
    periodeTom,
    begrunnelse: '',
    endretAv: 'VL',
    erVurdert: false,
    erAutomatiskVurdert: false,
    endretTidspunkt: '2020-03-19T09:08:56.8',
    behandlingId,
    avslagBegrunnelser: [],
    vurderesEtter: erIkkeGenereltVilkår(vilkårType) ? vurderesEtter : undefined,
    utdypendeVilkårsvurderinger: [],
});

export const mockRestPersonResultat = ({
    personIdent = '12345678930',
    vilkårResultater = [
        VilkårType.MEDLEMSKAP,
        VilkårType.BOSATT_I_RIKET,
        VilkårType.BARNEHAGEPLASS,
        VilkårType.MELLOM_1_OG_2_ELLER_ADOPTERT,
        VilkårType.BOR_MED_SØKER,
        VilkårType.MEDLEMSKAP_ANNEN_FORELDER,
    ].map((vilkårType, index) =>
        mockRestVilkårResultat({
            id: index,
            vilkårType: VilkårType[vilkårType],
        })
    ),
    andreVurderinger = [],
}: IMockRestPersonResultat = {}): IRestPersonResultat => ({
    personIdent,
    vilkårResultater,
    andreVurderinger,
});
