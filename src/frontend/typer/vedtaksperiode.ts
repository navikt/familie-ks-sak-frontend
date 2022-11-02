import type { FamilieIsoDate } from '../utils/kalender';
import { ytelsetype } from './beregning';
import type { IGrunnlagPerson } from './person';
import type { VedtakBegrunnelse, VedtakBegrunnelseType } from './vedtak';

export interface IVedtaksperiodeMedBegrunnelser {
    id: number;
    fom?: FamilieIsoDate;
    tom?: FamilieIsoDate;
    type: Vedtaksperiodetype;
    begrunnelser: IRestVedtaksbegrunnelse[];
    fritekster: string[];
    gyldigeBegrunnelser: VedtakBegrunnelse[];
    utbetalingsperiodeDetaljer: IUtbetalingsperiodeDetalj[];
}

export interface IRestVedtaksbegrunnelse {
    standardbegrunnelse: VedtakBegrunnelse;
    vedtakBegrunnelseType: VedtakBegrunnelseType;
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
          periodeFom: FamilieIsoDate;
          periodeTom?: FamilieIsoDate;
          vedtaksperiodetype: Vedtaksperiodetype.UTBETALING;
          utbetalingsperiodeDetaljer: IUtbetalingsperiodeDetalj[];
          antallBarn: number;
          utbetaltPerMnd: number;
      }
    | {
          periodeFom: FamilieIsoDate;
          periodeTom?: FamilieIsoDate;
          vedtaksperiodetype: Vedtaksperiodetype.OPPHØR;
      }
    | {
          periodeFom?: FamilieIsoDate;
          periodeTom?: FamilieIsoDate;
          vedtaksperiodetype: Vedtaksperiodetype.AVSLAG;
      }
    | {
          periodeFom?: FamilieIsoDate;
          periodeTom?: FamilieIsoDate;
          vedtaksperiodetype: Vedtaksperiodetype.FORTSATT_INNVILGET;
          utbetalingsperiode: Vedtaksperiode;
      };

export type Utbetalingsperiode = {
    periodeFom: FamilieIsoDate;
    periodeTom?: FamilieIsoDate;
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
