import type { IVedtaksperiodeMedBegrunnelser } from './vedtaksperiode';
import type { VilkårType } from './vilkår';
import type { IsoDatoString } from '../utils/dato';

export interface IVedtakForBehandling {
    aktiv: boolean;
    vedtaksdato: string;
    vedtaksperioderMedBegrunnelser: IVedtaksperiodeMedBegrunnelser[];
    id: number;
}

export interface IRestBegrunnelseTilknyttetVilkår {
    id: Begrunnelse;
    navn: string;
    vilkår?: VilkårType;
}

export type Begrunnelse = string;

export enum BegrunnelseType {
    INNVILGET = 'INNVILGET',
    EØS_INNVILGET = 'EØS_INNVILGET',
    AVSLAG = 'AVSLAG',
    EØS_AVSLAG = 'EØS_AVSLAG',
    REDUKSJON = 'REDUKSJON',
    OPPHØR = 'OPPHØR',
    EØS_OPPHØR = 'EØS_OPPHØR',
    FORTSATT_INNVILGET = 'FORTSATT_INNVILGET',
    ENDRET_UTBETALING = 'ENDRET_UTBETALING',
    ETTER_ENDRET_UTBETALING = 'ETTER_ENDRET_UTBETALING',
}

export const begrunnelseTyper: Record<BegrunnelseType, string> = {
    INNVILGET: 'Innvilgelse',
    EØS_INNVILGET: 'EØS - Innvilgelse',
    AVSLAG: 'Avslag',
    EØS_AVSLAG: 'EØS - Avslag',
    REDUKSJON: 'Reduksjon',
    OPPHØR: 'Opphør',
    EØS_OPPHØR: 'EØS - Opphør',
    FORTSATT_INNVILGET: 'Fortsatt innvilget',
    ENDRET_UTBETALING: 'Endret utbetaling',
    ETTER_ENDRET_UTBETALING: 'Etter endret utbetaling',
};

export enum Standardbegrunnelse {
    REDUKSJON_FRAMTIDIG_OPPHØR_BARNEHAGEPLASS = 'NasjonalEllerFellesBegrunnelse$REDUKSJON_FRAMTIDIG_OPPHØR_BARNEHAGEPLASS',
    OPPHØR_FRAMTIDIG_OPPHØR_BARNEHAGEPLASS = 'NasjonalEllerFellesBegrunnelse$OPPHØR_FRAMTIDIG_OPPHØR_BARNEHAGEPLASS',
    INNVILGET_OVERGANGSORDNING = 'NasjonalEllerFellesBegrunnelse$INNVILGET_OVERGANGSORDNING',
    INNVILGET_OVERGANGSORDNING_GRADERT_UTBETALING = 'NasjonalEllerFellesBegrunnelse$INNVILGET_OVERGANGSORDNING_GRADERT_UTBETALING',
    INNVILGET_OVERGANGSORDNING_DELT_BOSTED = 'NasjonalEllerFellesBegrunnelse$INNVILGET_OVERGANGSORDNING_DELT_BOSTED',
}

export interface IRestKorrigertVedtak {
    vedtaksdato: IsoDatoString;
    begrunnelse: string | undefined;
}

export interface IRestKorrigertEtterbetaling {
    årsak: KorrigertEtterbetalingÅrsak;
    beløp: number;
    begrunnelse: string;
}

export enum KorrigertEtterbetalingÅrsak {
    FEIL_TIDLIGERE_UTBETALT_BELØP = 'FEIL_TIDLIGERE_UTBETALT_BELØP',
    REFUSJON_FRA_ANDRE_MYNDIGHETER = 'REFUSJON_FRA_ANDRE_MYNDIGHETER',
    MOTREGNING = 'MOTREGNING',
}
