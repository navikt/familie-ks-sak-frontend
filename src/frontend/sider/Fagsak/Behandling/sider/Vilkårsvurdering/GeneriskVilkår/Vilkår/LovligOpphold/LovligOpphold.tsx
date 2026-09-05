import { Resultat } from '@typer/vilkår';

import { Box, InlineMessage } from '@navikt/ds-react';

import { IKKE_AKTUELT_ALTERNATIV, JA_NEI_ALTERNATIVER, ResultatFelt } from '../../ResultatFelt';
import { useVilkårResultatSkjema } from '../../useVilkårResultatSkjema';
import { VilkårSkjema, type VilkårProps } from '../../VilkårSkjema';
import { VilkårTabellRad } from '../../VilkårTabellRad';

export function LovligOpphold({
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

    const skalViseDatoVarsel =
        lagretVilkårResultat.resultat === Resultat.IKKE_VURDERT && lagretVilkårResultat.periode.fom !== undefined;

    return (
        <VilkårTabellRad lagretVilkårResultat={lagretVilkårResultat} form={form} onSubmit={onSubmit}>
            <VilkårSkjema
                lagretVilkårResultat={lagretVilkårResultat}
                vilkårFraConfig={vilkårFraConfig}
                person={person}
                visVurderesEtter
                periodeChildren={
                    skalViseDatoVarsel && (
                        <Box marginBlock={'space-16 space-0'}>
                            <InlineMessage status={'warning'} size={'small'}>
                                Du må dobbeltsjekke at foreslått f.o.m dato er korrekt
                            </InlineMessage>
                        </Box>
                    )
                }
            >
                <ResultatFelt
                    legend={vilkårFraConfig.spørsmål ? vilkårFraConfig.spørsmål(person.type.toLowerCase()) : ''}
                    alternativer={[...JA_NEI_ALTERNATIVER, IKKE_AKTUELT_ALTERNATIV]}
                />
            </VilkårSkjema>
        </VilkårTabellRad>
    );
}
