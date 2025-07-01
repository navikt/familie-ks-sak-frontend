import {
    addMonths,
    differenceInMilliseconds,
    isAfter,
    isBefore,
    isSameMonth,
    startOfMonth,
} from 'date-fns';

import type { GroupBase, OptionType } from '@navikt/familie-form-elements';
import { RessursStatus, type Ressurs } from '@navikt/familie-typer';

import { BehandlingResultat, BehandlingStatus } from '../../../../../../typer/behandling';
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
import type { AlleBegrunnelser } from '../../../../../../typer/vilkår';
import {
    hentDagensDato,
    isoStringTilDate,
    isoStringTilDateMedFallback,
    tidenesMorgen,
    type IsoDatoString,
} from '../../../../../../utils/dato';

export function grupperteBegrunnelser(
    vedtaksperiodeMedBegrunnelser: IVedtaksperiodeMedBegrunnelser,
    alleBegrunnelserRessurs: Ressurs<AlleBegrunnelser>
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
        alleBegrunnelserRessurs.status === RessursStatus.SUKSESS
            ? Object.keys(alleBegrunnelserRessurs.data)
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
                                          alleBegrunnelserRessurs.data[
                                              begrunnelseType as BegrunnelseType
                                          ].find(
                                              begrunnelseTilknyttetVilkår =>
                                                  begrunnelseTilknyttetVilkår.id === begrunnelse
                                          ) !== undefined
                                      );
                                  })
                                  .map((begrunnelse: Begrunnelse) => ({
                                      label:
                                          alleBegrunnelserRessurs.data[
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
    vilkårBegrunnelser: AlleBegrunnelser
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
    vilkårBegrunnelser: AlleBegrunnelser
) => {
    return (
        vilkårBegrunnelser[begrunnelseType].find(
            (restVedtakBegrunnelseTilknyttetVilkår: IRestBegrunnelseTilknyttetVilkår) =>
                restVedtakBegrunnelseTilknyttetVilkår.id === begrunnelse
        )?.navn ?? ''
    );
};

export const filtrerOgSorterPerioderMedBegrunnelseBehov = (
    vedtaksperioder: IVedtaksperiodeMedBegrunnelser[],
    behandlingResultat: BehandlingResultat,
    behandlingStatus: BehandlingStatus,
    sisteVedtaksperiodeVisningDato: IsoDatoString | undefined,
    skalAlltidViseAlleVedtaksperioder: boolean
): IVedtaksperiodeMedBegrunnelser[] => {
    const sorterteOgFiltrertePerioder = vedtaksperioder
        .slice()
        .sort((a, b) =>
            differenceInMilliseconds(
                isoStringTilDateMedFallback({ isoString: a.fom, fallbackDate: tidenesMorgen }),
                isoStringTilDateMedFallback({ isoString: b.fom, fallbackDate: tidenesMorgen })
            )
        )
        .filter((vedtaksperiode: IVedtaksperiodeMedBegrunnelser) => {
            if (behandlingStatus === BehandlingStatus.AVSLUTTET) {
                return harPeriodeBegrunnelse(vedtaksperiode);
            } else if (skalAlltidViseAlleVedtaksperioder) {
                return true;
            } else {
                return (
                    (sisteVedtaksperiodeVisningDato &&
                        erPeriodeMindreEllerLikEnnSisteVedtaksperiodeVisningDato(
                            sisteVedtaksperiodeVisningDato,
                            vedtaksperiode.fom
                        )) ||
                    erPeriode2MndFramITidEllerMindre(vedtaksperiode.fom)
                );
            }
        });

    if (
        behandlingResultat === BehandlingResultat.OPPHØRT ||
        behandlingResultat === BehandlingResultat.FORTSATT_OPPHØRT
    ) {
        return hentSisteOpphørsperiode(sorterteOgFiltrertePerioder);
    } else {
        return sorterteOgFiltrertePerioder;
    }
};

const erPeriodeMindreEllerLikEnnSisteVedtaksperiodeVisningDato = (
    sisteVedtaksperiodeVisningDato: string,
    periode: string | undefined
) => {
    return isAfter(
        isoStringTilDate(sisteVedtaksperiodeVisningDato),
        isoStringTilDateMedFallback({ isoString: periode, fallbackDate: tidenesMorgen })
    );
};

const erPeriode2MndFramITidEllerMindre = (periodeFom: string | undefined) => {
    const fom = isoStringTilDateMedFallback({ isoString: periodeFom, fallbackDate: tidenesMorgen });
    const toMånederFremITid = addMonths(startOfMonth(hentDagensDato()), 2);

    return isBefore(fom, toMånederFremITid) || isSameMonth(fom, toMånederFremITid);
};

const harPeriodeBegrunnelse = (vedtaksperiode: IVedtaksperiodeMedBegrunnelser) => {
    return !!vedtaksperiode.begrunnelser.length || !!vedtaksperiode.fritekster.length;
};

const hentSisteOpphørsperiode = (sortertePerioder: IVedtaksperiodeMedBegrunnelser[]) => {
    const sorterteOgFiltrerteOpphørsperioder = sortertePerioder.filter(
        (vedtaksperiode: IVedtaksperiodeMedBegrunnelser) =>
            vedtaksperiode.type === Vedtaksperiodetype.OPPHØR
    );
    const sisteOpphørsPeriode =
        sorterteOgFiltrerteOpphørsperioder[sorterteOgFiltrerteOpphørsperioder.length - 1];
    return sisteOpphørsPeriode ? [sisteOpphørsPeriode] : [];
};
