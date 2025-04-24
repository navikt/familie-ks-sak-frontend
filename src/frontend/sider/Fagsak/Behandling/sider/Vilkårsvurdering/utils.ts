import { differenceInMilliseconds } from 'date-fns';

import type { IGrunnlagPerson } from '../../../../../typer/person';
import { PersonTypeVisningsRangering } from '../../../../../typer/person';
import type {
    IPersonResultat,
    IRestAnnenVurdering,
    IRestPersonResultat,
    IRestVilkårResultat,
    IVilkårResultat,
} from '../../../../../typer/vilkår';
import { Resultat } from '../../../../../typer/vilkår';
import type { IIsoDatoPeriode } from '../../../../../utils/dato';
import {
    isoStringTilDate,
    isoStringTilDateMedFallback,
    nyIsoDatoPeriode,
    tidenesEnde,
} from '../../../../../utils/dato';

const periodeDiff = (periodeA: IIsoDatoPeriode, periodeB: IIsoDatoPeriode) => {
    if (!periodeA.fom && !periodeA.tom) {
        return 1;
    }
    return differenceInMilliseconds(
        isoStringTilDateMedFallback({ isoString: periodeA.fom, fallbackDate: tidenesEnde }),
        isoStringTilDateMedFallback({ isoString: periodeB.fom, fallbackDate: tidenesEnde })
    );
};

const sorterVilkårsvurderingForPerson = (
    vilkårResultater: IVilkårResultat[]
): IVilkårResultat[] => {
    return vilkårResultater.sort(
        (a, b) => a.vilkårType.localeCompare(b.vilkårType) || periodeDiff(a.periode, b.periode)
    );
};

/**
 * Funksjon som mapper vilkår for person.
 *
 * @param personResultater perioder fra api
 * @param personer personer på behandlingen
 */

export const mapFraRestVilkårsvurderingTilUi = (
    personResultater: IRestPersonResultat[],
    personer: IGrunnlagPerson[]
): IPersonResultat[] => {
    return mapFraRestPersonResultatTilPersonResultat(personResultater, personer);
};

const mapFraRestVilkårResultatTilVilkårResultat = (
    vilkårResultat: IRestVilkårResultat
): IVilkårResultat => {
    return {
        begrunnelse: vilkårResultat.begrunnelse,
        id: vilkårResultat.id,
        periode: nyIsoDatoPeriode(vilkårResultat.periodeFom, vilkårResultat.periodeTom),
        resultat: vilkårResultat.resultat,
        vilkårType: vilkårResultat.vilkårType,
        endretAv: vilkårResultat.endretAv,
        erVurdert: vilkårResultat.erVurdert,
        erAutomatiskVurdert: vilkårResultat.erAutomatiskVurdert,
        erEksplisittAvslagPåSøknad: vilkårResultat.erEksplisittAvslagPåSøknad,
        avslagBegrunnelser: vilkårResultat.avslagBegrunnelser,
        endretTidspunkt: vilkårResultat.endretTidspunkt,
        behandlingId: vilkårResultat.behandlingId,
        vurderesEtter: vilkårResultat.vurderesEtter,
        utdypendeVilkårsvurderinger: vilkårResultat.utdypendeVilkårsvurderinger,
        antallTimer: vilkårResultat.antallTimer,
        søkerHarMeldtFraOmBarnehageplass: vilkårResultat.søkerHarMeldtFraOmBarnehageplass,
    };
};

export const mapFraRestPersonResultatTilPersonResultat = (
    personResultater: IRestPersonResultat[],
    personer: IGrunnlagPerson[]
): IPersonResultat[] => {
    return personResultater
        .map((personResultat: IRestPersonResultat) => {
            const person: IGrunnlagPerson | undefined = personer.find(
                (person: IGrunnlagPerson) => person.personIdent === personResultat.personIdent
            );

            if (person === undefined) {
                throw new Error('Finner ikke person ved validering av vilkårsvurdering');
            } else {
                return {
                    person,
                    personIdent: personResultat.personIdent,
                    vilkårResultater: sorterVilkårsvurderingForPerson(
                        personResultat.vilkårResultater.map(
                            (vilkårResultat: IRestVilkårResultat) => {
                                return mapFraRestVilkårResultatTilVilkårResultat(vilkårResultat);
                            }
                        )
                    ),
                    andreVurderinger: personResultat.andreVurderinger.map(
                        (annenVurdering: IRestAnnenVurdering) => {
                            return {
                                begrunnelse: annenVurdering.begrunnelse,
                                id: annenVurdering.id,
                                resultat: annenVurdering.resultat,
                                endretAv: annenVurdering.endretAv,
                                erVurdert: annenVurdering.resultat !== Resultat.IKKE_VURDERT,
                                endretTidspunkt: annenVurdering.endretTidspunkt,
                                behandlingId: annenVurdering.behandlingId,
                                type: annenVurdering.type,
                            };
                        }
                    ),
                };
            }
        })
        .sort((a: IPersonResultat, b: IPersonResultat) => {
            if (
                PersonTypeVisningsRangering[a.person.type] >
                PersonTypeVisningsRangering[b.person.type]
            ) {
                return 1;
            }

            if (
                PersonTypeVisningsRangering[a.person.type] <
                PersonTypeVisningsRangering[b.person.type]
            ) {
                return -1;
            }

            return differenceInMilliseconds(
                isoStringTilDate(b.person.fødselsdato),
                isoStringTilDate(a.person.fødselsdato)
            );
        });
};
