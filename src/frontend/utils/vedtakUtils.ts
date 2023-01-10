import navFarger from 'nav-frontend-core';

import type { Ressurs } from '@navikt/familie-typer';
import { RessursStatus } from '@navikt/familie-typer';

import { BehandlingResultat, BehandlingStatus } from '../typer/behandling';
import type { IRestBegrunnelseTilknyttetVilkår, Begrunnelse } from '../typer/vedtak';
import { BegrunnelseType } from '../typer/vedtak';
import type { IVedtaksperiodeMedBegrunnelser } from '../typer/vedtaksperiode';
import { Vedtaksperiodetype } from '../typer/vedtaksperiode';
import type { VedtaksbegrunnelseTekster, VilkårType } from '../typer/vilkår';
import type { FamilieIsoDate } from './kalender';
import {
    førsteDagIInneværendeMåned,
    kalenderDato,
    kalenderDatoMedFallback,
    kalenderDatoTilDate,
    kalenderDiff,
    KalenderEnhet,
    leggTil,
    TIDENES_MORGEN,
} from './kalender';

export const filtrerOgSorterPerioderMedBegrunnelseBehov = (
    vedtaksperioder: IVedtaksperiodeMedBegrunnelser[],
    behandlingResultat: BehandlingResultat,
    behandlingStatus: BehandlingStatus,
    sisteVedtaksperiodeVisningDato: FamilieIsoDate | undefined
): IVedtaksperiodeMedBegrunnelser[] => {
    const sorterteOgFiltrertePerioder = vedtaksperioder
        .slice()
        .sort((a, b) =>
            kalenderDiff(
                kalenderDatoTilDate(kalenderDatoMedFallback(a.fom, TIDENES_MORGEN)),
                kalenderDatoTilDate(kalenderDatoMedFallback(b.fom, TIDENES_MORGEN))
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
    const sisteVedtaksperiodeKalenderDato = kalenderDato(sisteVedtaksperiodeVisningDato);

    const periodeIKalenderDato = kalenderDatoMedFallback(periode, TIDENES_MORGEN);

    return (
        kalenderDiff(
            kalenderDatoTilDate(periodeIKalenderDato),
            kalenderDatoTilDate(sisteVedtaksperiodeKalenderDato)
        ) <= 0
    );
};

const erPeriodeMindreEnn2MndFramITid = (periode: string | undefined) => {
    const periodeFom = kalenderDatoMedFallback(periode, TIDENES_MORGEN);
    const toMånederFremITid = leggTil(førsteDagIInneværendeMåned(), 2, KalenderEnhet.MÅNED);
    return (
        kalenderDiff(kalenderDatoTilDate(periodeFom), kalenderDatoTilDate(toMånederFremITid)) < 0
    );
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

export const finnVedtakBegrunnelseVilkår = (
    vilkårBegrunnelser: Ressurs<VedtaksbegrunnelseTekster>,
    begrunnelse: Begrunnelse
): VilkårType | undefined => {
    if (vilkårBegrunnelser.status === RessursStatus.SUKSESS) {
        Object.keys(vilkårBegrunnelser.data).forEach(begrunnelseType => {
            const match = vilkårBegrunnelser.data[begrunnelseType as BegrunnelseType].find(
                (begrunnelseTilknyttetVilkår: IRestBegrunnelseTilknyttetVilkår) =>
                    begrunnelseTilknyttetVilkår.id === begrunnelse
            );
            if (match !== undefined) return match.vilkår;
        });
    }
    return undefined;
};

export const hentBakgrunnsfarge = (begrunnelseType?: BegrunnelseType) => {
    switch (begrunnelseType) {
        case BegrunnelseType.INNVILGET:
        case BegrunnelseType.FORTSATT_INNVILGET:
            return navFarger.navGronnLighten80;
        case BegrunnelseType.AVSLAG:
            return navFarger.redErrorLighten80;
        case BegrunnelseType.REDUKSJON:
            return navFarger.navOransjeLighten80;
        case BegrunnelseType.OPPHØR:
            return navFarger.navLysGra;
        default:
            return navFarger.navBlaLighten80;
    }
};

export const hentBorderfarge = (begrunnelseType?: BegrunnelseType) => {
    switch (begrunnelseType) {
        case BegrunnelseType.INNVILGET:
        case BegrunnelseType.FORTSATT_INNVILGET:
            return navFarger.navGronn;
        case BegrunnelseType.AVSLAG:
            return navFarger.redErrorDarken20;
        case BegrunnelseType.REDUKSJON:
            return navFarger.navOransjeDarken20;
        case BegrunnelseType.OPPHØR:
            return navFarger.navGra60;
        default:
            return navFarger.navBlaLighten80;
    }
};
