import { addMonths, differenceInMilliseconds, isAfter, isBefore, startOfMonth } from 'date-fns';

import {
    ABlue100,
    AGray100,
    AGray600,
    AGreen100,
    AGreen500,
    AOrange100,
    AOrange600,
    ARed50,
    ARed600,
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
                    erPeriodeMindreEnn2MndFramITid(vedtaksperiode.fom)
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

const erPeriodeMindreEnn2MndFramITid = (periodeFom: string | undefined) => {
    const fom = isoStringTilDateMedFallback({ isoString: periodeFom, fallbackDate: tidenesMorgen });
    const toMånederFremITid = addMonths(startOfMonth(dagensDato), 2);

    return isBefore(fom, toMånederFremITid);
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
            return AGreen100;
        case BegrunnelseType.AVSLAG:
            return ARed50;
        case BegrunnelseType.REDUKSJON:
            return AOrange100;
        case BegrunnelseType.OPPHØR:
            return AGray100;
        default:
            return ABlue100;
    }
};

export const hentBorderfarge = (begrunnelseType?: BegrunnelseType) => {
    switch (begrunnelseType) {
        case BegrunnelseType.INNVILGET:
        case BegrunnelseType.FORTSATT_INNVILGET:
            return AGreen500;
        case BegrunnelseType.AVSLAG:
            return ARed600;
        case BegrunnelseType.REDUKSJON:
            return AOrange600;
        case BegrunnelseType.OPPHØR:
            return AGray600;
        default:
            return ABlue100;
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
