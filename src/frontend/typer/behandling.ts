import type { ISODateString } from '@navikt/familie-datovelger';

import type { BehandlingKategori } from './behandlingstema';
import type { IPersonMedAndelerTilkjentYtelse } from './beregning';
import type { INøkkelPar } from './common';
import type { IRestFeilutbetaltValuta } from './eøs-feilutbetalt-valuta';
import type { IRestKompetanse, IRestUtenlandskPeriodeBeløp, IRestValutakurs } from './eøsPerioder';
import type { KlageResultat, KlageStatus, KlageÅrsak } from './klage';
import type { IGrunnlagPerson } from './person';
import type { IRestRefusjonEøs } from './refusjon-eøs';
import type { ITilbakekreving } from './simulering';
import type { ISøknadDTO } from './søknad';
import type {
    Behandlingsstatus,
    TilbakekrevingsbehandlingResultat,
    TilbakekrevingsbehandlingÅrsak,
} from './tilbakekrevingsbehandling';
import type { ITotrinnskontroll } from './totrinnskontroll';
import type { IRestEndretUtbetalingAndel } from './utbetalingAndel';
import type { IRestKorrigertVedtak, IVedtakForBehandling } from './vedtak';
import type { Utbetalingsperiode } from './vedtaksperiode';
import type { IRestPersonResultat, IRestStegTilstand } from './vilkår';
import type { IsoDatoString } from '../utils/dato';
import type { FamilieIsoDate } from '../utils/kalender';

export interface IRestNyBehandling {
    kategori: BehandlingKategori | null;
    søkersIdent: string;
    behandlingType: Behandlingstype;
    behandlingÅrsak: BehandlingÅrsak;
    saksbehandlerIdent?: string;
    søknadMottattDato?: IsoDatoString;
}

export enum HenleggÅrsak {
    SØKNAD_TRUKKET = 'SØKNAD_TRUKKET',
    FEILAKTIG_OPPRETTET = 'FEILAKTIG_OPPRETTET',
    TEKNISK_VEDLIKEHOLD = 'TEKNISK_VEDLIKEHOLD',
}

export const henleggÅrsak: Record<HenleggÅrsak, string> = {
    SØKNAD_TRUKKET: 'Søknaden er trukket',
    FEILAKTIG_OPPRETTET: 'Behandlingen er feilaktig opprettet',
    TEKNISK_VEDLIKEHOLD: 'Teknisk vedlikehold',
};

export enum BehandlingÅrsak {
    SØKNAD = 'SØKNAD',
    ÅRLIG_KONTROLL = 'ÅRLIG_KONTROLL',
    DØDSFALL = 'DØDSFALL',
    NYE_OPPLYSNINGER = 'NYE_OPPLYSNINGER',
    KLAGE = 'KLAGE',
    KORREKSJON_VEDTAKSBREV = 'KORREKSJON_VEDTAKSBREV',
    SATSENDRING = 'SATSENDRING',
    BARNEHAGELISTE = 'BARNEHAGELISTE',
    TEKNISK_ENDRING = 'TEKNISK_ENDRING',
}

export const behandlingÅrsak: Record<
    BehandlingÅrsak | TilbakekrevingsbehandlingÅrsak | KlageÅrsak,
    string
> = {
    SØKNAD: 'Søknad',
    ÅRLIG_KONTROLL: 'Årlig kontroll',
    DØDSFALL: 'Dødsfall',
    NYE_OPPLYSNINGER: 'Nye opplysninger',
    KLAGE: 'Klage',
    KORREKSJON_VEDTAKSBREV: 'Korrigere vedtak med egen brevmal',
    SATSENDRING: 'Satsendring',
    BARNEHAGELISTE: 'Barnehageliste',
    TEKNISK_ENDRING: 'Teknisk Endring',

    /** De neste er revurderingsårsaker for tilbakekrevingsbehandlinger **/
    REVURDERING_KLAGE_NFP: 'Klage tilbakekreving',
    REVURDERING_KLAGE_KA: 'Klage omgjort av KA',
    REVURDERING_OPPLYSNINGER_OM_VILKÅR: 'Nye opplysninger',
    REVURDERING_OPPLYSNINGER_OM_FORELDELSE: 'Nye opplysninger',
    REVURDERING_FEILUTBETALT_BELØP_HELT_ELLER_DELVIS_BORTFALT:
        'Feilutbetalt beløp helt eller delvis bortfalt',

    /** Klage: **/
    ANNET: 'annet',
    FEIL_ELLER_ENDRET_FAKTA: 'Feil eller endret fakta',
    FEIL_I_LOVANDVENDELSE: 'Feil i lovanvendelse',
    FEIL_PROSESSUELL: 'Prosessuell feil',
    FEIL_REGELVERKSFORSTÅELSE: 'Feil regelverksforståelse',
    KØET_BEHANDLING: 'Køet behandling',
};

export enum BehandlingSteg {
    REGISTRERE_PERSONGRUNNLAG = 'REGISTRERE_PERSONGRUNNLAG',
    REGISTRERE_SØKNAD = 'REGISTRERE_SØKNAD',
    VILKÅRSVURDERING = 'VILKÅRSVURDERING',
    BEHANDLINGSRESULTAT = 'BEHANDLINGSRESULTAT',
    SIMULERING = 'SIMULERING',
    VEDTAK = 'VEDTAK',
    BESLUTTE_VEDTAK = 'BESLUTTE_VEDTAK',
    IVERKSETT_MOT_OPPDRAG = 'IVERKSETT_MOT_OPPDRAG',
    JOURNALFØR_VEDTAKSBREV = 'JOURNALFØR_VEDTAKSBREV',
    AVSLUTT_BEHANDLING = 'AVSLUTT_BEHANDLING',
}

export enum BehandlingStegStatus {
    UTFØRT = 'UTFØRT',
    IKKE_UTFØRT = 'IKKE_UTFØRT',
}

export const hentStegNummer = (steg: BehandlingSteg): number => {
    switch (steg) {
        case BehandlingSteg.REGISTRERE_PERSONGRUNNLAG:
            return 1;
        case BehandlingSteg.REGISTRERE_SØKNAD:
            return 2;
        case BehandlingSteg.VILKÅRSVURDERING:
            return 3;
        case BehandlingSteg.BEHANDLINGSRESULTAT:
            return 4;
        case BehandlingSteg.SIMULERING:
            return 5;
        case BehandlingSteg.VEDTAK:
            return 6;
        case BehandlingSteg.BESLUTTE_VEDTAK:
            return 7;
        case BehandlingSteg.IVERKSETT_MOT_OPPDRAG:
            return 8;
        case BehandlingSteg.JOURNALFØR_VEDTAKSBREV:
            return 9;
        case BehandlingSteg.AVSLUTT_BEHANDLING:
            return 10;
        default:
            return 0;
    }
};

export enum BehandlingStatus {
    OPPRETTET = 'OPPRETTET',
    UTREDES = 'UTREDES',
    FATTER_VEDTAK = 'FATTER_VEDTAK',
    IVERKSETTER_VEDTAK = 'IVERKSETTER_VEDTAK',
    AVSLUTTET = 'AVSLUTTET',
}

export enum Behandlingstype {
    FØRSTEGANGSBEHANDLING = 'FØRSTEGANGSBEHANDLING',
    REVURDERING = 'REVURDERING',
    TEKNISK_ENDRING = 'TEKNISK_ENDRING',
}

export enum BehandlingResultat {
    INNVILGET = 'INNVILGET',
    INNVILGET_OG_OPPHØRT = 'INNVILGET_OG_OPPHØRT',
    INNVILGET_OG_ENDRET = 'INNVILGET_OG_ENDRET',
    INNVILGET_ENDRET_OG_OPPHØRT = 'INNVILGET_ENDRET_OG_OPPHØRT',
    DELVIS_INNVILGET = 'DELVIS_INNVILGET',
    DELVIS_INNVILGET_OG_OPPHØRT = 'DELVIS_INNVILGET_OG_OPPHØRT',
    DELVIS_INNVILGET_OG_ENDRET = 'DELVIS_INNVILGET_OG_ENDRET',
    DELVIS_INNVILGET_ENDRET_OG_OPPHØRT = 'DELVIS_INNVILGET_ENDRET_OG_OPPHØRT',
    AVSLÅTT = 'AVSLÅTT',
    AVSLÅTT_OG_OPPHØRT = 'AVSLÅTT_OG_OPPHØRT',
    AVSLÅTT_OG_ENDRET = 'AVSLÅTT_OG_ENDRET',
    AVSLÅTT_ENDRET_OG_OPPHØRT = 'AVSLÅTT_ENDRET_OG_OPPHØRT',
    ENDRET_UTBETALING = 'ENDRET_UTBETALING',
    ENDRET_UTEN_UTBETALING = 'ENDRET_UTEN_UTBETALING',
    ENDRET_OG_OPPHØRT = 'ENDRET_OG_OPPHØRT',
    OPPHØRT = 'OPPHØRT',
    FORTSATT_OPPHØRT = 'FORTSATT_OPPHØRT',
    FORTSATT_INNVILGET = 'FORTSATT_INNVILGET',
    HENLAGT_FEILAKTIG_OPPRETTET = 'HENLAGT_FEILAKTIG_OPPRETTET',
    HENLAGT_SØKNAD_TRUKKET = 'HENLAGT_SØKNAD_TRUKKET',
    IKKE_VURDERT = 'IKKE_VURDERT',
    HENLAGT_TEKNISK_VEDLIKEHOLD = 'HENLAGT_TEKNISK_VEDLIKEHOLD',
}

export const erBehandlingHenlagt = (behandlingsresultat?: BehandlingResultat) => {
    return (
        behandlingsresultat === BehandlingResultat.HENLAGT_FEILAKTIG_OPPRETTET ||
        behandlingsresultat === BehandlingResultat.HENLAGT_SØKNAD_TRUKKET ||
        behandlingsresultat === BehandlingResultat.HENLAGT_TEKNISK_VEDLIKEHOLD
    );
};

export enum BehandlerRolle {
    UKJENT = 0,
    VEILEDER = 1,
    SAKSBEHANDLER = 2,
    BESLUTTER = 3,
    SYSTEM = 4,
}

export interface IBehandling {
    arbeidsfordelingPåBehandling: IArbeidsfordelingPåBehandling;
    behandlingId: number;
    endretAv: string;
    kategori: BehandlingKategori;
    opprettetTidspunkt: string;
    personResultater: IRestPersonResultat[];
    personer: IGrunnlagPerson[];
    resultat: BehandlingResultat;
    status: BehandlingStatus;
    steg: BehandlingSteg;
    stegTilstand: IRestStegTilstand[];
    søknadsgrunnlag?: ISøknadDTO;
    totrinnskontroll?: ITotrinnskontroll;
    type: Behandlingstype;
    vedtak?: IVedtakForBehandling;
    utbetalingsperioder: Utbetalingsperiode[];
    endretUtbetalingAndeler: IRestEndretUtbetalingAndel[];
    personerMedAndelerTilkjentYtelse: IPersonMedAndelerTilkjentYtelse[];
    årsak: BehandlingÅrsak;
    tilbakekreving?: ITilbakekreving;
    behandlingPåVent?: IBehandlingPåVent;
    søknadMottattDato?: string;
    endringstidspunkt?: string;
    kompetanser: IRestKompetanse[];
    utenlandskePeriodebeløp: IRestUtenlandskPeriodeBeløp[];
    valutakurser: IRestValutakurs[];
    korrigertVedtak?: IRestKorrigertVedtak;
    sisteVedtaksperiodeVisningDato?: FamilieIsoDate;
    feilutbetaltValuta: IRestFeilutbetaltValuta[];
    refusjonEøs: IRestRefusjonEøs[];
}

export interface IArbeidsfordelingPåBehandling {
    behandlendeEnhetId: string;
    behandlendeEnhetNavn: string;
    manueltOverstyrt: boolean;
}

export interface IOpprettBehandlingData {
    behandlingType: Behandlingstype;
    behandlingÅrsak: BehandlingÅrsak;
    kategori: BehandlingKategori;
    navIdent?: string;
    søkersIdent: string;
}

export const behandlerRoller: INøkkelPar = {
    SYSTEM: { id: 'SYSTEM', navn: 'System' },
    VEILEDER: { id: 'VEILEDER', navn: 'Veileder' },
    SAKSBEHANDLER: { id: 'SAKSBEHANDLER', navn: 'Saksbehandler' },
    BESLUTTER: { id: 'BESLUTTER', navn: 'Beslutter' },
};

export const behandlingstyper: INøkkelPar = {
    FØRSTEGANGSBEHANDLING: {
        id: 'FØRSTEGANGSBEHANDLING',
        navn: 'Førstegangsbehandling',
    },
    REVURDERING: {
        id: 'REVURDERING',
        navn: 'Revurdering',
    },
    TEKNISK_OPPHØR: {
        id: 'TEKNISK_OPPHØR',
        navn: 'Teknisk opphør',
    },
    TEKNISK_ENDRING: {
        id: 'TEKNISK_ENDRING',
        navn: 'Teknisk endring',
    },
    KLAGE: {
        id: 'KLAGE',
        navn: 'Klage',
    },
    /** Behandlingstyper for tilbakekreving **/
    TILBAKEKREVING: {
        id: 'TILBAKEKREVING',
        navn: 'Tilbakekreving',
    },
    REVURDERING_TILBAKEKREVING: {
        id: 'REVURDERING_TILBAKEKREVING',
        navn: 'Revurdering tilbakekreving',
    },
};

export const behandlingsresultater: Record<
    BehandlingResultat | TilbakekrevingsbehandlingResultat | KlageResultat,
    string
> = {
    INNVILGET: 'Innvilget',
    INNVILGET_OG_OPPHØRT: 'Innvilget og opphørt',
    INNVILGET_OG_ENDRET: 'Innvilget og endret',
    INNVILGET_ENDRET_OG_OPPHØRT: 'Innvilget, endret og opphørt',
    DELVIS_INNVILGET: 'Delvis innvilget',
    DELVIS_INNVILGET_OG_OPPHØRT: 'Delvis innvilget og opphørt',
    DELVIS_INNVILGET_OG_ENDRET: 'Delvis innvilget og endret',
    DELVIS_INNVILGET_ENDRET_OG_OPPHØRT: 'Delvis innvilget, endret og opphørt',
    AVSLÅTT: 'Avslått',
    AVSLÅTT_OG_OPPHØRT: 'Avslått og opphørt',
    AVSLÅTT_OG_ENDRET: 'Avslått og endret',
    AVSLÅTT_ENDRET_OG_OPPHØRT: 'Avslått, endret og opphørt',
    ENDRET_UTBETALING: 'Endret',
    ENDRET_UTEN_UTBETALING: 'Endret',
    ENDRET_OG_OPPHØRT: 'Endret og opphørt',
    OPPHØRT: 'Opphørt',
    FORTSATT_OPPHØRT: 'Fortsatt opphørt',
    FORTSATT_INNVILGET: 'Fortsatt innvilget',
    HENLAGT_FEILAKTIG_OPPRETTET: 'Henlagt (feilaktig opprettet)',
    HENLAGT_SØKNAD_TRUKKET: 'Henlagt (søknad trukket)',
    HENLAGT_TEKNISK_VEDLIKEHOLD: 'Henlagt teknisk vedlikehold',
    IKKE_VURDERT: 'Ikke vurdert',

    /** De neste er resultat for tilbakekrevingsbehandlinger **/
    IKKE_FASTSATT: 'Ikke fastsatt',
    INGEN_TILBAKEBETALING: 'Ingen tilbakebetaling',
    DELVIS_TILBAKEBETALING: 'Delvis tilbakebetaling',
    FULL_TILBAKEBETALING: 'Full tilbakebetaling',

    /** For klagebehandlinger: **/
    HENLAGT: 'Henlagt',
    IKKE_MEDHOLD: 'Ikke medhold',
    IKKE_MEDHOLD_FORMKRAV_AVVIST: 'Ikke medhold formkrav avvist',
    IKKE_SATT: 'Ikke satt',
    MEDHOLD: 'Medhold',
};

export const behandlingsstatuser: Record<
    BehandlingStatus | Behandlingsstatus | KlageStatus,
    string
> = {
    OPPRETTET: 'Opprettet',
    UTREDES: 'Utredes',
    FATTER_VEDTAK: 'Fatter vedtak',
    IVERKSETTER_VEDTAK: 'Iverksetter vedtak',
    AVSLUTTET: 'Avsluttet',

    /** For klagebehandlinger: **/
    VENTER: 'Venter',
    FERDIGSTILT: 'Ferdigstilt',
};

export interface IBehandlingPåVent {
    frist: ISODateString;
    årsak: SettPåVentÅrsak;
}

export enum SettPåVentÅrsak {
    AVVENTER_DOKUMENTASJON = 'AVVENTER_DOKUMENTASJON',
    AVVENTER_BEHANDLING = 'AVVENTER_BEHANDLING',
}

export const settPåVentÅrsaker: Record<SettPåVentÅrsak, string> = {
    AVVENTER_DOKUMENTASJON: 'Avventer dokumentasjon',
    AVVENTER_BEHANDLING: 'Avventer behandling',
};
