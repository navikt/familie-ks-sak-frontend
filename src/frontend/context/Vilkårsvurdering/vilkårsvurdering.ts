import type { IGrunnlagPerson } from '../../typer/person';
import { PersonTypeVisningsRangering } from '../../typer/person';
import type {
    IPersonResultat,
    IRestAnnenVurdering,
    IRestPersonResultat,
    IRestVilkårResultat,
    IVilkårResultat,
} from '../../typer/vilkår';
import { Resultat } from '../../typer/vilkår';
import {
    kalenderDato,
    kalenderDatoTilDate,
    kalenderDiff,
    nyPeriode,
    periodeDiff,
} from '../../utils/kalender';

export const sorterVilkårsvurderingForPerson = (
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
                                return {
                                    begrunnelse: vilkårResultat.begrunnelse,
                                    id: vilkårResultat.id,
                                    periode: nyPeriode(
                                        vilkårResultat.periodeFom,
                                        vilkårResultat.periodeTom
                                    ),
                                    resultat: vilkårResultat.resultat,
                                    vilkårType: vilkårResultat.vilkårType,
                                    endretAv: vilkårResultat.endretAv,
                                    erVurdert: vilkårResultat.erVurdert,
                                    erAutomatiskVurdert: vilkårResultat.erAutomatiskVurdert,
                                    erEksplisittAvslagPåSøknad:
                                        vilkårResultat.erEksplisittAvslagPåSøknad,
                                    avslagBegrunnelser: vilkårResultat.avslagBegrunnelser,
                                    endretTidspunkt: vilkårResultat.endretTidspunkt,
                                    behandlingId: vilkårResultat.behandlingId,
                                    vurderesEtter: vilkårResultat.vurderesEtter,
                                    utdypendeVilkårsvurderinger:
                                        vilkårResultat.utdypendeVilkårsvurderinger,
                                };
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

            return kalenderDiff(
                kalenderDatoTilDate(kalenderDato(b.person.fødselsdato)),
                kalenderDatoTilDate(kalenderDato(a.person.fødselsdato))
            );
        });
};
