import { useBehandling } from '@hooks/useBehandling';
import { Lovverk } from '@typer/lovverk';
import { type UtdypendeVilkårsvurdering, UtdypendeVilkårsvurderingGenerell, VilkårType } from '@typer/vilkår';
import {
    datoForLovendringAugust24,
    type IIsoDatoPeriode,
    isoStringTilDate,
    isoStringTilDateEllerUndefinedHvisUgyldigDato,
} from '@utils/dato';
import { sorterPåDato } from '@utils/formatter';
import { utledLovverk } from '@utils/lovverk';
import { isBefore } from 'date-fns';
import { useWatch } from 'react-hook-form';

import { AdopsjonsdatoFelt } from './AdopsjonsdatoFelt';
import { validerBegrunnelseForBarnetsAlder } from '../../../validering';
import { ResultatFelt } from '../../ResultatFelt';
import {
    useVilkårResultatSkjema,
    utledAdopsjonsdatoFraPerson,
    VilkårResultatFelt,
} from '../../useVilkårResultatSkjema';
import { VilkårSkjema, type VilkårProps } from '../../VilkårSkjema';
import { VilkårTabellRad } from '../../VilkårTabellRad';

const MULIGE_UTDYPENDE_VILKÅRSVURDERINGER: UtdypendeVilkårsvurdering[] = [UtdypendeVilkårsvurderingGenerell.ADOPSJON];

const hentSpørsmålForLovverkFør2025 = (periode: IIsoDatoPeriode) => {
    const fraOgMedDato = isoStringTilDateEllerUndefinedHvisUgyldigDato(periode.fom);
    const fraOgMedErFørLovendring = fraOgMedDato && isBefore(fraOgMedDato, datoForLovendringAugust24);
    return fraOgMedErFørLovendring
        ? 'Er barnet mellom 1 og 2 år eller adoptert?'
        : 'Er barnet mellom 13 og 19 måneder eller adoptert?';
};

const hentSpørsmålForLovverk = (lovverk: Lovverk, periode: IIsoDatoPeriode) =>
    lovverk === Lovverk.LOVENDRING_FEBRUAR_2025
        ? 'Er barnet mellom 12 og 20 måneder eller adoptert?'
        : hentSpørsmålForLovverkFør2025(periode);

export function BarnetsAlder({
    lagretVilkårResultat,
    vilkårFraConfig,
    person,
    settFokusPåLeggTilPeriodeKnapp,
}: VilkårProps) {
    const { personResultater } = useBehandling();

    const { form, onSubmit } = useVilkårResultatSkjema({
        lagretVilkårResultat,
        person,
        settFokusPåLeggTilPeriodeKnapp,
    });

    const { control, setValue } = form;

    const utdypendeVilkårsvurderinger = useWatch({ control, name: VilkårResultatFelt.UTDYPENDE_VILKÅRSVURDERINGER });
    const adopsjonsdato = useWatch({ control, name: VilkårResultatFelt.ADOPSJONSDATO });
    const periode = useWatch({ control, name: VilkårResultatFelt.PERIODE });

    const erAdopsjon = utdypendeVilkårsvurderinger.includes(UtdypendeVilkårsvurderingGenerell.ADOPSJON);

    const førsteLagredeFom = personResultater
        .find(personResultat => personResultat.personIdent === person.personIdent)
        ?.vilkårResultater.filter(vilkårResultat => vilkårResultat.vilkårType === VilkårType.BARNETS_ALDER)
        .toSorted((a, b) => {
            if (!a.periodeFom || !b.periodeFom) {
                return 1; // Perioder som ikke har fom skal sorteres sist i lista
            }
            return sorterPåDato(b.periodeFom, a.periodeFom);
        })[0]?.periodeFom;

    const lovverk = utledLovverk(
        isoStringTilDate(person.fødselsdato),
        erAdopsjon ? (adopsjonsdato ?? undefined) : undefined
    );

    return (
        <VilkårTabellRad lagretVilkårResultat={lagretVilkårResultat} form={form} onSubmit={onSubmit}>
            <VilkårSkjema
                lagretVilkårResultat={lagretVilkårResultat}
                vilkårFraConfig={vilkårFraConfig}
                person={person}
                muligeUtdypendeVilkårsvurderinger={MULIGE_UTDYPENDE_VILKÅRSVURDERINGER}
                onUtdypendeVilkårsvurderingerEndret={nyeUtdypendeVilkårsvurderinger => {
                    if (!nyeUtdypendeVilkårsvurderinger.includes(UtdypendeVilkårsvurderingGenerell.ADOPSJON)) {
                        setValue(VilkårResultatFelt.ADOPSJONSDATO, utledAdopsjonsdatoFraPerson(person), {
                            shouldDirty: true,
                        });
                    }
                }}
                utdypendeVilkårsvurderingChildren={
                    erAdopsjon && (
                        <AdopsjonsdatoFelt
                            key={person.adopsjonsdato}
                            fødselsdato={isoStringTilDate(person.fødselsdato)}
                        />
                    )
                }
                førsteLagredeFom={førsteLagredeFom}
                validerBegrunnelse={(begrunnelse, formValues) =>
                    validerBegrunnelseForBarnetsAlder(begrunnelse, {
                        vurderesEtter: formValues.vurderesEtter,
                        utdypendeVilkårsvurderinger: formValues.utdypendeVilkårsvurderinger,
                    })
                }
            >
                <ResultatFelt legend={hentSpørsmålForLovverk(lovverk, periode)} />
            </VilkårSkjema>
        </VilkårTabellRad>
    );
}
