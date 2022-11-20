import type { FamilieIsoDate, IPeriode } from '../utils/kalender';
import type { BehandlingSteg, BehandlingStegStatus } from './behandling';
import type { IGrunnlagPerson } from './person';
import { PersonType } from './person';
import type {
    IRestVedtakBegrunnelseTilknyttetVilkår,
    VedtakBegrunnelse,
    VedtakBegrunnelseType,
} from './vedtak';

export enum Resultat {
    IKKE_OPPFYLT = 'IKKE_OPPFYLT',
    OPPFYLT = 'OPPFYLT',
    IKKE_VURDERT = 'IKKE_VURDERT',
    IKKE_AKTUELT = 'IKKE_AKTUELT',
}

export const uiResultat: Record<Resultat, string> = {
    OPPFYLT: 'Oppfylt',
    IKKE_OPPFYLT: 'Ikke oppfylt',
    IKKE_VURDERT: 'Ikke vurdert',
    IKKE_AKTUELT: 'Ikke aktuelt',
};

export const resultater: Record<Resultat, string> = {
    OPPFYLT: 'Ja',
    IKKE_OPPFYLT: 'Nei',
    IKKE_VURDERT: 'Kanskje',
    IKKE_AKTUELT: 'Ikke aktuelt',
};

export enum AnnenVurderingType {
    OPPLYSNINGSPLIKT = 'OPPLYSNINGSPLIKT',
}

export enum VilkårType {
    BOSATT_I_RIKET = 'BOSATT_I_RIKET',
    MEDLEMSKAP = 'MEDLEMSKAP',
    BARNEHAGEPLASS = 'BARNEHAGEPLASS',
    MEDLEMSKAP_ANNEN_FORELDER = 'MEDLEMSKAP_ANNEN_FORELDER',
    BOR_MED_SØKER = 'BOR_MED_SØKER',
    BARNETS_ALDER = 'BARNETS_ALDER',
}

export enum Regelverk {
    NASJONALE_REGLER = 'NASJONALE_REGLER',
    EØS_FORORDNINGEN = 'EØS_FORORDNINGEN',
}

// Vilkårsvurdering typer for ui
export interface IPersonResultat {
    personIdent: string;
    vilkårResultater: IVilkårResultat[];
    andreVurderinger: IAnnenVurdering[];
    person: IGrunnlagPerson;
}
export interface IAnnenVurdering {
    id: number;
    begrunnelse: string;
    behandlingId: number;
    endretAv: string;
    endretTidspunkt: string;
    erVurdert: boolean;
    resultat: Resultat;
    type: AnnenVurderingType;
}

export interface IVilkårResultat {
    begrunnelse: string;
    behandlingId: number;
    endretAv: string;
    endretTidspunkt: string;
    erAutomatiskVurdert: boolean;
    erVurdert: boolean;
    id: number;
    periode: IPeriode;
    resultat: Resultat;
    vilkårType: VilkårType;
    erEksplisittAvslagPåSøknad?: boolean;
    avslagBegrunnelser: VedtakBegrunnelse[];
    vurderesEtter: Regelverk | undefined;
    utdypendeVilkårsvurderinger: UtdypendeVilkårsvurdering[];
    antallTimer?: number;
}

// Vilkårsvurdering typer for api
export interface IRestPersonResultat {
    personIdent: string;
    vilkårResultater: IRestVilkårResultat[];
    andreVurderinger: IRestAnnenVurdering[];
}

// Vilkårsvurdering typer for api
export interface IEndreVilkårResultat {
    personIdent: string;
    endretVilkårResultat: IRestVilkårResultat;
}

export interface IRestNyttVilkår {
    personIdent: string;
    vilkårType: string;
}

export interface IRestVilkårResultat {
    begrunnelse: string;
    behandlingId: number;
    endretAv: string;
    endretTidspunkt: string;
    erAutomatiskVurdert: boolean;
    erVurdert: boolean;
    id: number;
    periodeFom?: FamilieIsoDate;
    periodeTom?: FamilieIsoDate;
    resultat: Resultat;
    erEksplisittAvslagPåSøknad?: boolean;
    avslagBegrunnelser: VedtakBegrunnelse[];
    vilkårType: VilkårType;
    vurderesEtter: Regelverk | undefined;
    utdypendeVilkårsvurderinger: UtdypendeVilkårsvurdering[];
    antallTimer: number | undefined;
}

export interface IRestAnnenVurdering {
    id: number;
    begrunnelse: string;
    behandlingId: number;
    endretAv: string;
    endretTidspunkt: string;
    erVurdert: boolean;
    resultat: Resultat;
    type: AnnenVurderingType;
}

export interface IRestStegTilstand {
    behandlingSteg: BehandlingSteg;
    behandlingStegStatus: BehandlingStegStatus;
}

export type VedtaksbegrunnelseTekster = {
    [key in VedtakBegrunnelseType]: IRestVedtakBegrunnelseTilknyttetVilkår[];
};

export interface IVilkårConfig {
    beskrivelse: string;
    key: string;
    spørsmål?: (part?: string) => string;
    tittel: string;
    parterDetteGjelderFor: PersonType[];
}

export const vilkårConfig: Record<VilkårType, IVilkårConfig> = {
    BOSATT_I_RIKET: {
        beskrivelse: 'bosatt i riket',
        key: 'BOSATT_I_RIKET',
        tittel: 'Bosatt i riket',
        spørsmål: (part?: string) => `Er ${part} bosatt i riket?`,
        parterDetteGjelderFor: [PersonType.BARN, PersonType.SØKER],
    },
    MEDLEMSKAP: {
        beskrivelse: 'Har medlemskap i folketrygden',
        key: 'MEDLEMSKAP',
        tittel: 'Medlemskap',
        spørsmål: () => 'Har søker vært medlem i folketrygden i minst 5 år?',
        parterDetteGjelderFor: [PersonType.SØKER],
    },
    BARNEHAGEPLASS: {
        beskrivelse: 'Har barnehageplass',
        key: 'BARNEHAGEPLASS',
        tittel: 'Barnehageplass',
        spørsmål: () => 'Har barnet barnehageplass?',
        parterDetteGjelderFor: [PersonType.BARN],
    },
    MEDLEMSKAP_ANNEN_FORELDER: {
        beskrivelse: 'Har annen forelder medlemskap i folketrygden',
        key: 'MEDLEMSKAP_ANNEN_FORELDER',
        tittel: 'Medlemskap annen forelder',
        spørsmål: () => 'Har annen forelder vært medlem i folketrygden i minst 5 år?',
        parterDetteGjelderFor: [PersonType.BARN],
    },
    BOR_MED_SØKER: {
        beskrivelse: 'Bor med søker',
        key: 'BOR_MED_SØKER',
        tittel: 'Bor fast hos søker',
        spørsmål: () => 'Bor barnet fast hos søker?',
        parterDetteGjelderFor: [PersonType.BARN],
    },
    BARNETS_ALDER: {
        beskrivelse: 'Barn mellom 1 og 2 år eller adoptert',
        key: 'BARNETS_ALDER',
        tittel: 'Barnets alder',
        spørsmål: () => 'Er barnet mellom 1 og 2 år eller adoptert?',
        parterDetteGjelderFor: [PersonType.BARN],
    },
};

export interface IAnnenVurderingConfig {
    beskrivelse: string;
    key: string;
    tittel: string;
    parterDetteGjelderFor: PersonType[];
    spørsmål?: (part?: string) => string;
}

export const annenVurderingConfig: Record<AnnenVurderingType, IAnnenVurderingConfig> = {
    OPPLYSNINGSPLIKT: {
        beskrivelse: 'Opplysningsplikt',
        key: 'OPPLYSNINGSPLIKT',
        tittel: 'Opplysningsplikt',
        parterDetteGjelderFor: [PersonType.SØKER],
        spørsmål: () => 'Er opplysningsplikten oppfylt?',
    },
};

export enum UtdypendeVilkårsvurdering {
    VURDERING_ANNET_GRUNNLAG = 'VURDERING_ANNET_GRUNNLAG',
    DELT_BOSTED = 'DELT_BOSTED',
    DELT_BOSTED_SKAL_IKKE_DELES = 'DELT_BOSTED_SKAL_IKKE_DELES',
    ADOPSJON = 'ADOPSJON',
    SOMMERFERIE = 'SOMMERFERIE',
}

export enum UtdypendeVilkårsvurderingDeltBosted {
    DELT_BOSTED = 'DELT_BOSTED',
    DELT_BOSTED_SKAL_IKKE_DELES = 'DELT_BOSTED_SKAL_IKKE_DELES',
}

export enum UtdypendeVilkårsvurderingEøsBarnBorMedSøker {
    BARN_BOR_I_NORGE_MED_SØKER = 'BARN_BOR_I_NORGE_MED_SØKER',
    BARN_BOR_I_EØS_MED_SØKER = 'BARN_BOR_I_EØS_MED_SØKER',
    BARN_BOR_I_EØS_MED_ANNEN_FORELDER = 'BARN_BOR_I_EØS_MED_ANNEN_FORELDER',
    BARN_BOR_I_STORBRITANNIA_MED_SØKER = 'BARN_BOR_I_STORBRITANNIA_MED_SØKER',
    BARN_BOR_I_STORBRITANNIA_MED_ANNEN_FORELDER = 'BARN_BOR_I_STORBRITANNIA_MED_ANNEN_FORELDER',
    BARN_BOR_ALENE_I_ANNET_EØS_LAND = 'BARN_BOR_ALENE_I_ANNET_EØS_LAND',
}
