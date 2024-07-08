import {
    addMonths,
    differenceInMilliseconds,
    isAfter,
    isBefore,
    isSameMonth,
    startOfMonth,
} from 'date-fns';

import {
    ABorderDanger,
    ABorderDefault,
    ABorderSubtle,
    ABorderSuccess,
    ABorderWarning,
    ASurfaceActionSubtle,
    ASurfaceDangerSubtle,
    ASurfaceNeutralSubtle,
    ASurfaceSuccessSubtle,
    ASurfaceWarningSubtle,
} from '@navikt/ds-tokens/dist/tokens';
import type { Ressurs } from '@navikt/familie-typer';
import { RessursStatus } from '@navikt/familie-typer';

import type { IsoDatoString } from './dato';
import { dagensDato, isoStringTilDate, isoStringTilDateMedFallback, tidenesMorgen } from './dato';
import { BehandlingResultat, BehandlingStatus } from '../typer/behandling';
import type { IRestBegrunnelseTilknyttetVilkår, Begrunnelse } from '../typer/vedtak';
import { BegrunnelseType } from '../typer/vedtak';
import type { IVedtaksperiodeMedBegrunnelser } from '../typer/vedtaksperiode';
import { Vedtaksperiodetype } from '../typer/vedtaksperiode';
import type { VedtaksbegrunnelseTekster } from '../typer/vilkår';

export const filtrerOgSorterPerioderMedBegrunnelseBehov = (
    vedtaksperioder: IVedtaksperiodeMedBegrunnelser[],
    behandlingResultat: BehandlingResultat,
    behandlingStatus: BehandlingStatus,
    sisteVedtaksperiodeVisningDato: IsoDatoString | undefined
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
    const toMånederFremITid = addMonths(startOfMonth(dagensDato), 2);

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

export const finnBegrunnelseType = (
    vilkårBegrunnelser: Ressurs<VedtaksbegrunnelseTekster>,
    begrunnelse: Begrunnelse
): BegrunnelseType | undefined => {
    return vilkårBegrunnelser.status === RessursStatus.SUKSESS
        ? (Object.keys(vilkårBegrunnelser.data).find(begrunnelseType => {
              return (
                  vilkårBegrunnelser.data[begrunnelseType as BegrunnelseType].find(
                      (begrunnelseTilknyttetVilkår: IRestBegrunnelseTilknyttetVilkår) =>
                          begrunnelseTilknyttetVilkår.id === begrunnelse
                  ) !== undefined
              );
          }) as BegrunnelseType)
        : undefined;
};

export const hentBakgrunnsfarge = (begrunnelseType?: BegrunnelseType) => {
    switch (begrunnelseType) {
        case BegrunnelseType.INNVILGET:
        case BegrunnelseType.FORTSATT_INNVILGET:
            return ASurfaceSuccessSubtle;
        case BegrunnelseType.AVSLAG:
            return ASurfaceDangerSubtle;
        case BegrunnelseType.REDUKSJON:
            return ASurfaceWarningSubtle;
        case BegrunnelseType.OPPHØR:
            return ASurfaceNeutralSubtle;
        default:
            return ASurfaceActionSubtle;
    }
};

export const hentBorderfarge = (begrunnelseType?: BegrunnelseType) => {
    switch (begrunnelseType) {
        case BegrunnelseType.INNVILGET:
        case BegrunnelseType.FORTSATT_INNVILGET:
            return ABorderSuccess;
        case BegrunnelseType.AVSLAG:
            return ABorderDanger;
        case BegrunnelseType.REDUKSJON:
            return ABorderWarning;
        case BegrunnelseType.OPPHØR:
            return ABorderDefault;
        default:
            return ABorderSubtle;
    }
};

export const vedtakHarFortsattUtbetaling = (behandlingResultat: BehandlingResultat) =>
    [
        BehandlingResultat.INNVILGET,
        BehandlingResultat.INNVILGET_OG_OPPHØRT,
        BehandlingResultat.INNVILGET_OG_ENDRET,
        BehandlingResultat.INNVILGET_ENDRET_OG_OPPHØRT,
        BehandlingResultat.DELVIS_INNVILGET,
        BehandlingResultat.DELVIS_INNVILGET_OG_OPPHØRT,
        BehandlingResultat.DELVIS_INNVILGET_OG_ENDRET,
        BehandlingResultat.DELVIS_INNVILGET_ENDRET_OG_OPPHØRT,
        BehandlingResultat.AVSLÅTT_OG_ENDRET,
        BehandlingResultat.AVSLÅTT_ENDRET_OG_OPPHØRT,
        BehandlingResultat.ENDRET_UTBETALING,
        BehandlingResultat.ENDRET_OG_OPPHØRT,
        BehandlingResultat.FORTSATT_INNVILGET,
    ].includes(behandlingResultat);
