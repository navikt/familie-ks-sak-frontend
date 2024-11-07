import type { YtelseType } from './beregning';
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
    støtterFritekst: boolean;
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
    OPPHØR = 'OPPHØR',
    AVSLAG = 'AVSLAG',
    FORTSATT_INNVILGET = 'FORTSATT_INNVILGET',
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
    ytelseType: YtelseType;
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
            type === Vedtaksperiodetype.FORTSATT_INNVILGET) &&
        utbetalingsperiodeDetaljer.length > 0
    ) {
        return ytelsetype.ORDINÆR_KONTANTSTØTTE.navn;
    }

    switch (type) {
        case Vedtaksperiodetype.OPPHØR:
            return 'Opphør';
        case Vedtaksperiodetype.AVSLAG:
            return 'Avslag';
        default:
            return '';
    }
};
