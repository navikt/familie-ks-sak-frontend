import { addDays, isAfter, isBefore, isSameDay } from 'date-fns';

import type { FeiloppsummeringFeil } from '@navikt/familie-skjema';

import { annenVurderingFeilmeldingId } from '../../komponenter/Fagsak/Vilkårsvurdering/GeneriskAnnenVurdering/AnnenVurderingTabell';
import { vilkårFeilmeldingId } from '../../komponenter/Fagsak/Vilkårsvurdering/GeneriskVilkår/VilkårTabell';
import type { IPersonResultat, IVilkårResultat, IAnnenVurdering } from '../../typer/vilkår';
import { annenVurderingConfig, Resultat, vilkårConfig, VilkårType } from '../../typer/vilkår';
import type { IIsoDatoPeriode, IsoDatoString } from '../../utils/dato';
import { isoStringTilDateMedFallback, tidenesEnde, tidenesMorgen } from '../../utils/dato';

export const hentFeilIVilkårsvurdering = (
    personResultater: IPersonResultat[]
): FeiloppsummeringFeil[] => {
    return personResultater.flatMap(personResultat => {
        const oppfylteBarnetsAlderVilkårResultater = personResultat.vilkårResultater.filter(
            vilkårResultat =>
                vilkårResultat.vilkårType === VilkårType.BARNETS_ALDER &&
                vilkårResultat.resultat === Resultat.OPPFYLT
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

const hentIkkeVurderteAndreVurderingerFeil = (
    personResultat: IPersonResultat
): FeiloppsummeringFeil[] =>
    personResultat.andreVurderinger
        .filter(
            (annenVurdering: IAnnenVurdering) => annenVurdering.resultat === Resultat.IKKE_VURDERT
        )
        .map(annenVurdering => ({
            skjemaelementId: annenVurderingFeilmeldingId(annenVurdering),
            feilmelding: `Et vilkår av typen '${
                annenVurderingConfig[annenVurdering.type].tittel
            }' er ikke fullstendig`,
        }));

const hentIkkeVurderteVilkårFeil = (personResultat: IPersonResultat): FeiloppsummeringFeil[] =>
    personResultat.vilkårResultater
        .filter(
            (vilkårResultat: IVilkårResultat) => vilkårResultat.resultat === Resultat.IKKE_VURDERT
        )
        .map(vilkårResultat => ({
            feilmelding: `Et vilkår av typen '${
                vilkårConfig[vilkårResultat.vilkårType].tittel
            }' er ikke fullstendig`,
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
            starterEtter(
                barnehageplassVilkårResultat.periode,
                sisteOppfylteBarnetsAlderVilkårResultat?.periode
            )
        )
        .map(vilkårResultat => ({
            skjemaelementId: vilkårFeilmeldingId(vilkårResultat),
            feilmelding:
                'Du har lagt til en periode på barnehageplassvilkåret ' +
                'som starter etter at barnet har fylt 2 år eller startet på skolen. ' +
                'Du må fjerne denne perioden for å kunne fortsette.',
        }));
};

const hentBarnetsalderVilkårManglerBarnehagePeriodeFeil = (
    oppfylteBarnetsAlderVilkårResultater: IVilkårResultat[],
    barnehageplassVilkårResultater: IVilkårResultat[]
): FeiloppsummeringFeil[] =>
    oppfylteBarnetsAlderVilkårResultater
        .filter(barnetsAlderPeriode => {
            return barnetsAlderPeriodeManglerBarnehagePeriode(
                barnetsAlderPeriode.periode,
                barnehageplassVilkårResultater.map(vilkårResultat => vilkårResultat.periode)
            );
        })
        .map(vilkårResultat => ({
            skjemaelementId: vilkårFeilmeldingId(vilkårResultat),
            feilmelding:
                'Det mangler vurdering på vilkåret "barnehageplass". ' +
                'Hele eller deler av perioden der barnet er mellom 1 og 2 år er ikke vurdert.',
        }));

const erFørEllerSammeDato = (dato1: Date, dato2: Date) =>
    isBefore(dato1, dato2) || isSameDay(dato1, dato2);

const erEtterEllerSammeDato = (dato1: Date, dato2: Date) =>
    isAfter(dato1, dato2) || isSameDay(dato1, dato2);

const barnetsAlderPeriodeManglerBarnehagePeriode = (
    barnetsAlderPeriode: IIsoDatoPeriode,
    barnehagePerioder: IIsoDatoPeriode[]
): boolean => {
    const sammenSlåtteBarnehageperioder =
        slåSammenPerioderSomLiggerInntilHveranre(barnehagePerioder);

    return !sammenSlåtteBarnehageperioder.some(sammenslåttBarnehageperiode => {
        return (
            erFørEllerSammeDato(
                parseFraOgMedDato(sammenslåttBarnehageperiode.fom),
                parseFraOgMedDato(barnetsAlderPeriode.fom)
            ) &&
            erEtterEllerSammeDato(
                parseTilOgMedDato(sammenslåttBarnehageperiode.tom),
                parseTilOgMedDato(barnetsAlderPeriode.tom)
            )
        );
    });
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

const slåSammenPerioderSomLiggerInntilHveranre = (
    perioder: IIsoDatoPeriode[]
): IIsoDatoPeriode[] => {
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

const parseTilOgMedDato = (tom: IsoDatoString | undefined) =>
    isoStringTilDateMedFallback({
        isoString: tom,
        fallbackDate: tidenesEnde,
    });

const parseFraOgMedDato = (fom: IsoDatoString | undefined) =>
    isoStringTilDateMedFallback({
        isoString: fom,
        fallbackDate: tidenesMorgen,
    });
