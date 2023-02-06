import type { FeiloppsummeringFeil } from '@navikt/familie-skjema';

import { annenVurderingFeilmeldingId } from '../../komponenter/Fagsak/Vilkårsvurdering/GeneriskAnnenVurdering/AnnenVurderingTabell';
import { vilkårFeilmeldingId } from '../../komponenter/Fagsak/Vilkårsvurdering/GeneriskVilkår/VilkårTabell';
import type { IPersonResultat, IVilkårResultat, IAnnenVurdering } from '../../typer/vilkår';
import { annenVurderingConfig, Resultat, vilkårConfig, VilkårType } from '../../typer/vilkår';
import type { FamilieIsoDate, IPeriode } from '../../utils/kalender';
import {
    erEtter,
    erEtterEllerSamme,
    erFørEllerSamme,
    erSamme,
    KalenderEnhet,
    leggTil,
    parseIso8601String,
    serializeIso8601String,
    TIDENES_ENDE,
    TIDENES_MORGEN,
} from '../../utils/kalender';

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
            return parseFraOgMedDato(senesteVilkårResultat?.periode.fom) >
                parseFraOgMedDato(vilkårResultat.periode.fom)
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

const barnetsAlderPeriodeManglerBarnehagePeriode = (
    barnetsAlderPeriode: IPeriode,
    barnehagePerioder: IPeriode[]
): boolean => {
    const sammenSlåtteBarnehageperioder =
        slåSammenPerioderSomLiggerInntilHveranre(barnehagePerioder);

    return !sammenSlåtteBarnehageperioder.some(sammenslåttBarnehageperiode => {
        return (
            erFørEllerSamme(
                parseFraOgMedDato(sammenslåttBarnehageperiode.fom),
                parseFraOgMedDato(barnetsAlderPeriode.fom)
            ) &&
            erEtterEllerSamme(
                parseTilOgMedDato(sammenslåttBarnehageperiode.tom),
                parseTilOgMedDato(barnetsAlderPeriode.tom)
            )
        );
    });
};

function starterEtter(
    barnehageplassVilkårResultat: IPeriode | undefined,
    barnetsAlderPeriode: IPeriode | undefined
) {
    return erEtter(
        parseIso8601String(
            barnehageplassVilkårResultat?.fom ?? serializeIso8601String(TIDENES_MORGEN)
        ),
        parseIso8601String(barnetsAlderPeriode?.tom ?? serializeIso8601String(TIDENES_ENDE))
    );
}

const slåSammenPerioderSomLiggerInntilHveranre = (perioder: IPeriode[]): IPeriode[] => {
    return perioder.reduce((acc: IPeriode[], periode) => {
        const forrigePeriode: IPeriode | undefined = acc[acc.length - 1];

        if (erEtterHverandre(forrigePeriode, periode)) {
            return [...acc.slice(0, -1), { fom: forrigePeriode.fom, tom: periode.tom }];
        } else {
            return [...acc, periode];
        }
    }, []);
};

const erEtterHverandre = (første: IPeriode | undefined, andre: IPeriode): boolean => {
    const tomDatoFørste = parseTilOgMedDato(første?.tom);
    const fomDatoNeste = parseFraOgMedDato(andre.fom);

    const dagenEtterTomDatoFørste = leggTil(tomDatoFørste, 1, KalenderEnhet.DAG);

    return erSamme(dagenEtterTomDatoFørste, fomDatoNeste);
};

const parseTilOgMedDato = (tom: FamilieIsoDate | undefined) =>
    parseIso8601String(tom ?? serializeIso8601String(TIDENES_ENDE));

const parseFraOgMedDato = (fom: FamilieIsoDate | undefined) =>
    parseIso8601String(fom ?? serializeIso8601String(TIDENES_MORGEN));
