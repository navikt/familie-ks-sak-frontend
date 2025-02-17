import type { BehandlingSteg, BehandlingStegStatus } from './behandling';
import type { IGrunnlagPerson } from './person';
import { PersonType } from './person';
import type { IRestBegrunnelseTilknyttetVilkår, Begrunnelse, BegrunnelseType } from './vedtak';
import type { IIsoDatoPeriode, IsoDatoString } from '../utils/dato';

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

enum AnnenVurderingType {
    OPPLYSNINGSPLIKT = 'OPPLYSNINGSPLIKT',
}

export enum VilkårType {
    BOSATT_I_RIKET = 'BOSATT_I_RIKET',
    MEDLEMSKAP = 'MEDLEMSKAP',
    BARNEHAGEPLASS = 'BARNEHAGEPLASS',
    MEDLEMSKAP_ANNEN_FORELDER = 'MEDLEMSKAP_ANNEN_FORELDER',
    BOR_MED_SØKER = 'BOR_MED_SØKER',
    BARNETS_ALDER = 'BARNETS_ALDER',
    LOVLIG_OPPHOLD = 'LOVLIG_OPPHOLD',
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
    periode: IIsoDatoPeriode;
    resultat: Resultat;
    vilkårType: VilkårType;
    erEksplisittAvslagPåSøknad?: boolean;
    avslagBegrunnelser: Begrunnelse[];
    vurderesEtter: Regelverk | undefined;
    utdypendeVilkårsvurderinger: UtdypendeVilkårsvurdering[];
    antallTimer?: number;
    søkerHarMeldtFraOmBarnehageplass?: boolean;
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
    adopsjonsdato?: string;
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
    periodeFom?: IsoDatoString;
    periodeTom?: IsoDatoString;
    resultat: Resultat;
    erEksplisittAvslagPåSøknad?: boolean;
    avslagBegrunnelser: Begrunnelse[];
    vilkårType: VilkårType;
    vurderesEtter: Regelverk | undefined;
    utdypendeVilkårsvurderinger: UtdypendeVilkårsvurdering[];
    antallTimer: number | undefined;
    søkerHarMeldtFraOmBarnehageplass?: boolean;
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
    [key in BegrunnelseType]: IRestBegrunnelseTilknyttetVilkår[];
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
    LOVLIG_OPPHOLD: {
        beskrivelse: 'lovlig opphold',
        key: 'LOVLIG_OPPHOLD',
        tittel: 'Lovlig opphold',
        spørsmål: (part?: string) => `Har ${part} lovlig opphold?`,
        parterDetteGjelderFor: [PersonType.SØKER],
    },
    BOR_MED_SØKER: {
        beskrivelse: 'Bor med søker',
        key: 'BOR_MED_SØKER',
        tittel: 'Bor fast hos søker',
        spørsmål: () => 'Bor barnet fast hos søker?',
        parterDetteGjelderFor: [PersonType.BARN],
    },
    MEDLEMSKAP_ANNEN_FORELDER: {
        beskrivelse: 'Har annen forelder medlemskap i folketrygden',
        key: 'MEDLEMSKAP_ANNEN_FORELDER',
        tittel: 'Medlemskap annen forelder',
        spørsmål: () => 'Har annen forelder vært medlem i folketrygden i minst 5 år?',
        parterDetteGjelderFor: [PersonType.BARN],
    },
    BARNEHAGEPLASS: {
        beskrivelse: 'Har barnehageplass',
        key: 'BARNEHAGEPLASS',
        tittel: 'Barnehageplass',
        spørsmål: () => 'Har barnet barnehageplass?',
        parterDetteGjelderFor: [PersonType.BARN],
    },
    MEDLEMSKAP: {
        beskrivelse: 'Har medlemskap i folketrygden',
        key: 'MEDLEMSKAP',
        tittel: 'Medlemskap',
        spørsmål: () => 'Har søker vært medlem i folketrygden i minst 5 år?',
        parterDetteGjelderFor: [PersonType.SØKER],
    },
    BARNETS_ALDER: {
        beskrivelse: 'Barnets alder',
        key: 'BARNETS_ALDER',
        tittel: 'Barnets alder',
        spørsmål: (spørsmål?: string) => `${spørsmål}`,
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

export enum UtdypendeVilkårsvurderingGenerell {
    VURDERING_ANNET_GRUNNLAG = 'VURDERING_ANNET_GRUNNLAG',
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

export enum UtdypendeVilkårsvurderingEøsSøkerBosattIRiket {
    OMFATTET_AV_NORSK_LOVGIVNING = 'OMFATTET_AV_NORSK_LOVGIVNING',
    OMFATTET_AV_NORSK_LOVGIVNING_UTLAND = 'OMFATTET_AV_NORSK_LOVGIVNING_UTLAND',
    ANNEN_FORELDER_OMFATTET_AV_NORSK_LOVGIVNING = 'ANNEN_FORELDER_OMFATTET_AV_NORSK_LOVGIVNING',
}

export enum UtdypendeVilkårsvurderingEøsBarnBosattIRiket {
    BARN_BOR_I_NORGE = 'BARN_BOR_I_NORGE',
    BARN_BOR_I_EØS = 'BARN_BOR_I_EØS',
    BARN_BOR_I_STORBRITANNIA = 'BARN_BOR_I_STORBRITANNIA',
}

export type UtdypendeVilkårsvurdering =
    | UtdypendeVilkårsvurderingGenerell
    | UtdypendeVilkårsvurderingDeltBosted
    | UtdypendeVilkårsvurderingEøsBarnBorMedSøker
    | UtdypendeVilkårsvurderingEøsSøkerBosattIRiket
    | UtdypendeVilkårsvurderingEøsBarnBosattIRiket;
