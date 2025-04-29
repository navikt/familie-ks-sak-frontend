import type { GroupBase } from 'react-select';

import type { Ressurs } from '@navikt/familie-typer';
import { RessursStatus } from '@navikt/familie-typer';

import { useVedtaksbegrunnelseTekster } from './VedtaksbegrunnelseTeksterContext';
import type { OptionType } from '../../../../../../typer/common';
import type { IRestBegrunnelseTilknyttetVilkår, Begrunnelse } from '../../../../../../typer/vedtak';
import { BegrunnelseType, begrunnelseTyper } from '../../../../../../typer/vedtak';
import type {
    IRestVedtaksbegrunnelse,
    IVedtaksperiodeMedBegrunnelser,
} from '../../../../../../typer/vedtaksperiode';
import { Vedtaksperiodetype } from '../../../../../../typer/vedtaksperiode';
import type { VedtaksbegrunnelseTekster } from '../../../../../../typer/vilkår';

export const useVilkårBegrunnelser = ({
    vedtaksperiodeMedBegrunnelser,
}: {
    vedtaksperiodeMedBegrunnelser: IVedtaksperiodeMedBegrunnelser;
}) => {
    const { vedtaksbegrunnelseTekster } = useVedtaksbegrunnelseTekster();

    const vedtaksperiodeTilBegrunnelseTyper = () => {
        switch (vedtaksperiodeMedBegrunnelser.type) {
            case Vedtaksperiodetype.UTBETALING:
                return [
                    BegrunnelseType.INNVILGET,
                    BegrunnelseType.EØS_INNVILGET,
                    BegrunnelseType.REDUKSJON,
                    BegrunnelseType.FORTSATT_INNVILGET,
                    BegrunnelseType.ETTER_ENDRET_UTBETALING,
                    BegrunnelseType.ENDRET_UTBETALING,
                ];
            case Vedtaksperiodetype.FORTSATT_INNVILGET:
                return [BegrunnelseType.FORTSATT_INNVILGET];
            case Vedtaksperiodetype.OPPHØR:
                return [
                    BegrunnelseType.OPPHØR,
                    BegrunnelseType.EØS_OPPHØR,
                    BegrunnelseType.ETTER_ENDRET_UTBETALING,
                ];
            default:
                return [];
        }
    };

    const begrunnelseTyperKnyttetTilVedtaksperiodetype = vedtaksperiodeTilBegrunnelseTyper();

    const grupperteBegrunnelserFraBackend =
        vedtaksbegrunnelseTekster.status === RessursStatus.SUKSESS
            ? Object.keys(vedtaksbegrunnelseTekster.data)
                  .filter((begrunnelseType: string) =>
                      begrunnelseTyperKnyttetTilVedtaksperiodetype.includes(
                          begrunnelseType as BegrunnelseType
                      )
                  )
                  .reduce((acc: GroupBase<OptionType>[], begrunnelseType: string) => {
                      return [
                          ...acc,
                          {
                              label: begrunnelseTyper[begrunnelseType as BegrunnelseType],
                              options: vedtaksperiodeMedBegrunnelser.gyldigeBegrunnelser
                                  .filter((begrunnelse: Begrunnelse) => {
                                      return (
                                          vedtaksbegrunnelseTekster.data[
                                              begrunnelseType as BegrunnelseType
                                          ].find(
                                              begrunnelseTilknyttetVilkår =>
                                                  begrunnelseTilknyttetVilkår.id === begrunnelse
                                          ) !== undefined
                                      );
                                  })
                                  .map((begrunnelse: Begrunnelse) => ({
                                      label:
                                          vedtaksbegrunnelseTekster.data[
                                              begrunnelseType as BegrunnelseType
                                          ].find(
                                              begrunnelseTilknyttetVilkår =>
                                                  begrunnelseTilknyttetVilkår.id === begrunnelse
                                          )?.navn ?? begrunnelse,
                                      value: begrunnelse,
                                  })),
                          },
                      ];
                  }, [])
            : [];

    return { grupperteBegrunnelser: grupperteBegrunnelserFraBackend, vedtaksbegrunnelseTekster };
};

export const mapBegrunnelserTilSelectOptions = (
    vedtaksperiodeMedBegrunnelser: IVedtaksperiodeMedBegrunnelser,
    vilkårBegrunnelser: Ressurs<VedtaksbegrunnelseTekster>
): OptionType[] => {
    const alleBegrunnelser = [
        ...vedtaksperiodeMedBegrunnelser.begrunnelser,
        ...vedtaksperiodeMedBegrunnelser.eøsBegrunnelser,
    ];
    return alleBegrunnelser.map((begrunnelse: IRestVedtaksbegrunnelse) => ({
        value: begrunnelse.begrunnelse.toString(),
        label: hentLabelForOption(
            begrunnelse.begrunnelseType,
            begrunnelse.begrunnelse,
            vilkårBegrunnelser
        ),
    }));
};

const hentLabelForOption = (
    begrunnelseType: BegrunnelseType,
    begrunnelse: Begrunnelse,
    vilkårBegrunnelser: Ressurs<VedtaksbegrunnelseTekster>
) => {
    return vilkårBegrunnelser.status === RessursStatus.SUKSESS
        ? (vilkårBegrunnelser.data[begrunnelseType].find(
              (restVedtakBegrunnelseTilknyttetVilkår: IRestBegrunnelseTilknyttetVilkår) =>
                  restVedtakBegrunnelseTilknyttetVilkår.id === begrunnelse
          )?.navn ?? '')
        : '';
};
