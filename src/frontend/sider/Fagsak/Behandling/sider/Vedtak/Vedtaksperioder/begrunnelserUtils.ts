import type { GroupBase, OptionType } from '@navikt/familie-form-elements';
import { RessursStatus, type Ressurs } from '@navikt/familie-typer';

import {
    BegrunnelseType,
    begrunnelseTyper,
    type Begrunnelse,
    type IRestBegrunnelseTilknyttetVilkår,
} from '../../../../../../typer/vedtak';
import {
    Vedtaksperiodetype,
    type IRestVedtaksbegrunnelse,
    type IVedtaksperiodeMedBegrunnelser,
} from '../../../../../../typer/vedtaksperiode';
import type { VedtaksbegrunnelseTekster } from '../../../../../../typer/vilkår';

export function grupperteBegrunnelser(
    vedtaksperiodeMedBegrunnelser: IVedtaksperiodeMedBegrunnelser,
    vedtaksbegrunnelseTekster: Ressurs<VedtaksbegrunnelseTekster>
) {
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

    return grupperteBegrunnelserFraBackend;
}

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
