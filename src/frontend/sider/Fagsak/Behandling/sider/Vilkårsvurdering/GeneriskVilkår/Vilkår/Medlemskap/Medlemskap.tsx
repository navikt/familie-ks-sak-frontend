import { Regelverk, Resultat } from '@typer/vilkår';
import { useWatch } from 'react-hook-form';

import { Box, InlineMessage } from '@navikt/ds-react';

import { IKKE_AKTUELT_ALTERNATIV, JA_NEI_ALTERNATIVER, ResultatFelt } from '../../ResultatFelt';
import { useVilkårResultatSkjema, VilkårResultatFelt } from '../../useVilkårResultatSkjema';
import { VilkårSkjema, type VilkårProps } from '../../VilkårSkjema';
import { VilkårTabellRad } from '../../VilkårTabellRad';

export function Medlemskap({
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
    const vurderesEtterEøs = vurderesEtter === Regelverk.EØS_FORORDNINGEN;

    const skalViseDatoVarsel =
        lagretVilkårResultat.resultat === Resultat.IKKE_VURDERT && lagretVilkårResultat.periode.fom !== undefined;

    return (
        <VilkårTabellRad lagretVilkårResultat={lagretVilkårResultat} form={form} onSubmit={onSubmit}>
            <VilkårSkjema
                lagretVilkårResultat={lagretVilkårResultat}
                vilkårFraConfig={vilkårFraConfig}
                person={person}
                visVurderesEtter
                onVurderesEtterEndret={nyttRegelverk => {
                    if (nyttRegelverk === Regelverk.NASJONALE_REGLER) {
                        form.setValue(VilkårResultatFelt.RESULTAT, Resultat.IKKE_VURDERT, { shouldDirty: true });
                    }
                }}
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
                {vurderesEtterEøs && (
                    <InlineMessage status="info">
                        Du må vurdere dette vilkåret når søker er omfattet av norsk lovgivning
                    </InlineMessage>
                )}
                <ResultatFelt
                    legend={vilkårFraConfig.spørsmål ? vilkårFraConfig.spørsmål(person.type.toLowerCase()) : ''}
                    alternativer={
                        vurderesEtterEøs ? [...JA_NEI_ALTERNATIVER, IKKE_AKTUELT_ALTERNATIV] : JA_NEI_ALTERNATIVER
                    }
                />
            </VilkårSkjema>
        </VilkårTabellRad>
    );
}
