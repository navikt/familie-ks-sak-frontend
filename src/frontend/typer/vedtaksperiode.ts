import { ytelsetype } from './beregning';
import type { IGrunnlagPerson } from './person';
import type { Begrunnelse, BegrunnelseType } from './vedtak';
import type { IsoDatoString } from '../utils/dato';

export interface IVedtaksperiodeMedBegrunnelser {
    id: number;
    fom?: IsoDatoString;
    tom?: IsoDatoString;
    type: Vedtaksperiodetype;
    begrunnelser: IRestVedtaksbegrunnelse[];
    eøsBegrunnelser: IRestVedtaksbegrunnelse[];
    fritekster: string[];
    gyldigeBegrunnelser: Begrunnelse[];
    utbetalingsperiodeDetaljer: IUtbetalingsperiodeDetalj[];
}

export interface IRestVedtaksbegrunnelse {
    begrunnelse: Begrunnelse;
    begrunnelseType: BegrunnelseType;
    støtterFritekst: boolean;
}

export interface IRestPutVedtaksperiodeMedFritekster {
    fritekster: string[];
}

export enum Vedtaksperiodetype {
    UTBETALING = 'UTBETALING',
    UTBETALING_MED_REDUKSJON_FRA_SIST_IVERKSATTE_BEHANDLING = 'UTBETALING_MED_REDUKSJON_FRA_SIST_IVERKSATTE_BEHANDLING',
    OPPHØR = 'OPPHØR',
    AVSLAG = 'AVSLAG',
    FORTSATT_INNVILGET = 'FORTSATT_INNVILGET',
    ENDRET_UTBETALING = 'ENDRET_UTBETALING',
}

export type Vedtaksperiode =
    | {
          periodeFom: IsoDatoString;
          periodeTom?: IsoDatoString;
          vedtaksperiodetype: Vedtaksperiodetype.UTBETALING;
          utbetalingsperiodeDetaljer: IUtbetalingsperiodeDetalj[];
          antallBarn: number;
          utbetaltPerMnd: number;
      }
    | {
          periodeFom: IsoDatoString;
          periodeTom?: IsoDatoString;
          vedtaksperiodetype: Vedtaksperiodetype.OPPHØR;
      }
    | {
          periodeFom?: IsoDatoString;
          periodeTom?: IsoDatoString;
          vedtaksperiodetype: Vedtaksperiodetype.AVSLAG;
      }
    | {
          periodeFom?: IsoDatoString;
          periodeTom?: IsoDatoString;
          vedtaksperiodetype: Vedtaksperiodetype.FORTSATT_INNVILGET;
          utbetalingsperiode: Vedtaksperiode;
      };

export type Utbetalingsperiode = {
    periodeFom: IsoDatoString;
    periodeTom?: IsoDatoString;
    vedtaksperiodetype: Vedtaksperiodetype.UTBETALING;
    utbetalingsperiodeDetaljer: IUtbetalingsperiodeDetalj[];
    antallBarn: number;
    utbetaltPerMnd: number;
};

export interface IUtbetalingsperiodeDetalj {
    person: IGrunnlagPerson;
    utbetaltPerMnd: number;
    prosent: number;
    erPåvirketAvEndring: boolean;
}

export interface IRestOverstyrtEndringstidspunkt {
    overstyrtEndringstidspunkt: IsoDatoString;
    behandlingId: number;
}

export const hentVedtaksperiodeTittel = (
    vedtaksperiodeMedBegrunnelser: IVedtaksperiodeMedBegrunnelser
) => {
    const { type, utbetalingsperiodeDetaljer } = vedtaksperiodeMedBegrunnelser;

    if (
        (type === Vedtaksperiodetype.UTBETALING ||
            type === Vedtaksperiodetype.UTBETALING_MED_REDUKSJON_FRA_SIST_IVERKSATTE_BEHANDLING ||
            type === Vedtaksperiodetype.FORTSATT_INNVILGET) &&
        utbetalingsperiodeDetaljer.length > 0
    ) {
        return ytelsetype.ORDINÆR_KONTANTSTØTTE.navn;
    }

    switch (type) {
        case Vedtaksperiodetype.ENDRET_UTBETALING:
            return 'Endret utbetalingsperiode';
        case Vedtaksperiodetype.OPPHØR:
            return 'Opphør';
        case Vedtaksperiodetype.AVSLAG:
            return 'Avslag';
        default:
            return '';
    }
};
