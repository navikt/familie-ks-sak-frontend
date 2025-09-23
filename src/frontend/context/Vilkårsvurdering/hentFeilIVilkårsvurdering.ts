import { addDays, isAfter, isSameDay } from 'date-fns';

import type { FeiloppsummeringFeil } from '@navikt/familie-skjema';

import { annenVurderingFeilmeldingId } from '../../sider/Fagsak/Behandling/sider/Vilkårsvurdering/GeneriskAnnenVurdering/AnnenVurderingTabell';
import { vilkårFeilmeldingId } from '../../sider/Fagsak/Behandling/sider/Vilkårsvurdering/GeneriskVilkår/VilkårTabell';
import type { IPersonResultat, IVilkårResultat, IAnnenVurdering } from '../../typer/vilkår';
import { annenVurderingConfig, Resultat, vilkårConfig, VilkårType } from '../../typer/vilkår';
import type { IIsoDatoPeriode } from '../../utils/dato';
import {
    isoStringTilDateMedFallback,
    parseTilOgMedDato,
    parseFraOgMedDato,
    tidenesEnde,
    tidenesMorgen,
    erFørEllerSammeDato,
    erEtterEllerSammeDato,
} from '../../utils/dato';

export const hentFeilIVilkårsvurdering = (personResultater: IPersonResultat[]): FeiloppsummeringFeil[] => {
    return personResultater.flatMap(personResultat => {
        const oppfylteBarnetsAlderVilkårResultater = personResultat.vilkårResultater.filter(
            vilkårResultat =>
                vilkårResultat.vilkårType === VilkårType.BARNETS_ALDER && vilkårResultat.resultat === Resultat.OPPFYLT
        );

        const barnehageplassVilkårResultater = personResultat.vilkårResultater.filter(
            vilkårResultat => vilkårResultat.vilkårType === VilkårType.BARNEHAGEPLASS
        );

        return [
            ...hentIkkeVurderteVilkårFeil(personResultat),
            ...hentIkkeVurderteAndreVurderingerFeil(personResultat),
            ...hentBarnehageplassPeriodeStarterForSentFeil(
                oppfylteBarnetsAlderVilkårResultater,
                barnehageplassVilkårResultater
            ),
            ...hentBarnetsalderVilkårManglerBarnehagePeriodeFeil(
                oppfylteBarnetsAlderVilkårResultater,
                barnehageplassVilkårResultater
            ),
        ];
    });
};

const hentIkkeVurderteAndreVurderingerFeil = (personResultat: IPersonResultat): FeiloppsummeringFeil[] =>
    personResultat.andreVurderinger
        .filter((annenVurdering: IAnnenVurdering) => annenVurdering.resultat === Resultat.IKKE_VURDERT)
        .map(annenVurdering => ({
            skjemaelementId: annenVurderingFeilmeldingId(annenVurdering),
            feilmelding: `Et vilkår av typen '${annenVurderingConfig[annenVurdering.type].tittel}' er ikke fullstendig`,
        }));

const hentIkkeVurderteVilkårFeil = (personResultat: IPersonResultat): FeiloppsummeringFeil[] =>
    personResultat.vilkårResultater
        .filter((vilkårResultat: IVilkårResultat) => vilkårResultat.resultat === Resultat.IKKE_VURDERT)
        .map(vilkårResultat => ({
            feilmelding: `Et vilkår av typen '${vilkårConfig[vilkårResultat.vilkårType].tittel}' er ikke fullstendig`,
            skjemaelementId: vilkårFeilmeldingId(vilkårResultat),
        }));

const hentBarnehageplassPeriodeStarterForSentFeil = (
    oppfylteBarnetsAlderVilkårResultater: IVilkårResultat[],
    barnehageplassVilkårResultater: IVilkårResultat[]
): FeiloppsummeringFeil[] => {
    const sisteOppfylteBarnetsAlderVilkårResultat = oppfylteBarnetsAlderVilkårResultater.reduce(
        (senesteVilkårResultat: IVilkårResultat | undefined, vilkårResultat) => {
            return isAfter(
                parseFraOgMedDato(senesteVilkårResultat?.periode.fom),
                parseFraOgMedDato(vilkårResultat.periode.fom)
            )
                ? senesteVilkårResultat
                : vilkårResultat;
        },
        undefined
    );

    return barnehageplassVilkårResultater
        .filter(barnehageplassVilkårResultat =>
            starterEtter(barnehageplassVilkårResultat.periode, sisteOppfylteBarnetsAlderVilkårResultat?.periode)
        )
        .map(vilkårResultat => ({
            skjemaelementId: vilkårFeilmeldingId(vilkårResultat),
            feilmelding:
                'Du har lagt til en periode på vilkåret "Barnehageplass" ' +
                'som starter etter at "Barnets alder"-vilkåret er avsluttet. ' +
                'Du må fjerne denne perioden for å kunne fortsette.',
        }));
};

const hentBarnetsalderVilkårManglerBarnehagePeriodeFeil = (
    oppfylteBarnetsAlderVilkårResultater: IVilkårResultat[],
    barnehageplassVilkårResultater: IVilkårResultat[]
): FeiloppsummeringFeil[] => {
    const feiledeVilkårResultater = oppfylteBarnetsAlderVilkårResultater.filter(barnetsAlderPeriode => {
        return barnetsAlderPeriodeManglerBarnehagePeriode(barnetsAlderPeriode.periode, barnehageplassVilkårResultater);
    });

    return feiledeVilkårResultater.length > 0
        ? [
              {
                  skjemaelementId: vilkårFeilmeldingId(feiledeVilkårResultater[0]),
                  feilmelding:
                      'Det mangler vurdering på vilkåret "Barnehageplass". ' +
                      'Hele eller deler av perioden der "Barnets alder"-vilkåret er oppfylt er ikke vurdert.',
              },
          ]
        : [];
};

const barnetsAlderPeriodeManglerBarnehagePeriode = (
    barnetsAlderPeriode: IIsoDatoPeriode,
    barnehageplassVilkårResultater: IVilkårResultat[]
): boolean => {
    const barnehagePerioder = barnehageplassVilkårResultater.map(vilkårResultat => vilkårResultat.periode);
    const sammenSlåtteBarnehageperioder = slåSammenPerioderSomLiggerInntilHverandre(barnehagePerioder);

    if (sammenSlåtteBarnehageperioder.length !== 1) {
        return true;
    }

    const periodeMedFramtidigOpphørPgaBarnehageplass = barnehageplassVilkårResultater.find(
        vilkårresultat => vilkårresultat.søkerHarMeldtFraOmBarnehageplass
    )?.periode;

    const sammenslåttBarnehageperiode = sammenSlåtteBarnehageperioder[0];

    const barnehageperiodeOverlapperFraStartenAvBarnetsAlderPeriode = erFørEllerSammeDato(
        parseFraOgMedDato(sammenslåttBarnehageperiode.fom),
        parseFraOgMedDato(barnetsAlderPeriode.fom)
    );
    const sistePeriodeHarFramtidigOpphørPgaBarnehageplass =
        periodeMedFramtidigOpphørPgaBarnehageplass &&
        erEtterEllerSammeDato(
            parseTilOgMedDato(periodeMedFramtidigOpphørPgaBarnehageplass.tom),
            parseTilOgMedDato(sammenslåttBarnehageperiode.tom)
        );
    const barnehageperiodeOverlapperTilSluttenAvBarnetsAlderPeriode = erEtterEllerSammeDato(
        parseTilOgMedDato(sammenslåttBarnehageperiode.tom),
        parseTilOgMedDato(barnetsAlderPeriode.tom)
    );
    return !(
        barnehageperiodeOverlapperFraStartenAvBarnetsAlderPeriode &&
        (sistePeriodeHarFramtidigOpphørPgaBarnehageplass || barnehageperiodeOverlapperTilSluttenAvBarnetsAlderPeriode)
    );
};

function starterEtter(
    barnehageplassVilkårResultat: IIsoDatoPeriode | undefined,
    barnetsAlderPeriode: IIsoDatoPeriode | undefined
) {
    return isAfter(
        isoStringTilDateMedFallback({
            isoString: barnehageplassVilkårResultat?.fom,
            fallbackDate: tidenesMorgen,
        }),
        isoStringTilDateMedFallback({
            isoString: barnetsAlderPeriode?.tom,
            fallbackDate: tidenesEnde,
        })
    );
}

const slåSammenPerioderSomLiggerInntilHverandre = (perioder: IIsoDatoPeriode[]): IIsoDatoPeriode[] => {
    return perioder.reduce((acc: IIsoDatoPeriode[], periode) => {
        const forrigePeriode: IIsoDatoPeriode | undefined = acc[acc.length - 1];

        if (erEtterHverandre(forrigePeriode, periode)) {
            return [...acc.slice(0, -1), { fom: forrigePeriode.fom, tom: periode.tom }];
        } else {
            return [...acc, periode];
        }
    }, []);
};

const erEtterHverandre = (første: IIsoDatoPeriode | undefined, andre: IIsoDatoPeriode): boolean => {
    const tomDatoFørste = parseTilOgMedDato(første?.tom);
    const fomDatoNeste = parseFraOgMedDato(andre.fom);

    const dagenEtterTomDatoFørste = addDays(tomDatoFørste, 1);

    return isSameDay(dagenEtterTomDatoFørste, fomDatoNeste);
};
