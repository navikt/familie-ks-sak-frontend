import { Regelverk, Resultat } from '@typer/vilkår';
import { useWatch } from 'react-hook-form';

import { InlineMessage } from '@navikt/ds-react';

import { JA_NEI_ALTERNATIVER, ResultatFelt } from '../../ResultatFelt';
import { useVilkårResultatSkjema, VilkårResultatFelt } from '../../useVilkårResultatSkjema';
import { VilkårSkjema, type VilkårProps } from '../../VilkårSkjema';
import { VilkårTabellRad } from '../../VilkårTabellRad';

export function MedlemskapAnnenForelder({
    lagretVilkårResultat,
    vilkårFraConfig,
    person,
    settFokusPåLeggTilPeriodeKnapp,
}: VilkårProps) {
    const { form, onSubmit } = useVilkårResultatSkjema({
        lagretVilkårResultat,
        person,
        settFokusPåLeggTilPeriodeKnapp,
    });

    const vurderesEtter = useWatch({ control: form.control, name: VilkårResultatFelt.VURDERES_ETTER });

    return (
        <VilkårTabellRad lagretVilkårResultat={lagretVilkårResultat} form={form} onSubmit={onSubmit}>
            <VilkårSkjema
                lagretVilkårResultat={lagretVilkårResultat}
                vilkårFraConfig={vilkårFraConfig}
                person={person}
                visVurderesEtter
            >
                {vurderesEtter === Regelverk.EØS_FORORDNINGEN && (
                    <InlineMessage status="info">
                        Du må vurdere dette vilkåret når den andre forelderen er omfattet av norsk lovgivning og søker
                        har selvstendig rett
                    </InlineMessage>
                )}
                <ResultatFelt
                    legend={vilkårFraConfig.spørsmål ? vilkårFraConfig.spørsmål(person.type.toLowerCase()) : ''}
                    alternativer={[
                        ...JA_NEI_ALTERNATIVER,
                        { verdi: Resultat.IKKE_AKTUELT, label: 'Ikke aktuelt - Bor ikke sammen' },
                    ]}
                />
            </VilkårSkjema>
        </VilkårTabellRad>
    );
}
