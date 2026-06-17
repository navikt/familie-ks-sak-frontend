import { useErLesevisning } from '@hooks/useErLesevisning';
import { useEkspanderbarVilkårResultatRad } from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/EkspanderbareVilkårResultatRaderContext';
import { Resultat } from '@typer/vilkår';

import { Box, InlineMessage, Label, Radio, RadioGroup } from '@navikt/ds-react';

import { useLovligOpphold } from './LovligOppholdContext';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { VilkårTabellRad } from '../../VilkårTabellRad';

type LovligOppholdProps = IVilkårSkjemaBaseProps;

export const LovligOpphold = ({
    lagretVilkårResultat,
    vilkårFraConfig,
    person,
    settFokusPåLeggTilPeriodeKnapp,
}: LovligOppholdProps) => {
    const erLesevisning = useErLesevisning();

    const { vilkårSkjemaContext, finnesEndringerSomIkkeErLagret, skalViseDatoVarsel } = useLovligOpphold(
        lagretVilkårResultat,
        person
    );

    const skjema = vilkårSkjemaContext.skjema;

    const { erRadEkspandert, toggleRad } = useEkspanderbarVilkårResultatRad(lagretVilkårResultat.id);

    function toggleForm(visAlert: boolean) {
        toggleRad(visAlert && finnesEndringerSomIkkeErLagret());
    }

    const nullstillAvslagBegrunnelser = () => {
        skjema.felter.erEksplisittAvslagPåSøknad.validerOgSettFelt(false);
        skjema.felter.avslagBegrunnelser.validerOgSettFelt([]);
    };

    return (
        <VilkårTabellRad
            lagretVilkårResultat={lagretVilkårResultat}
            erVilkårEkspandert={erRadEkspandert}
            toggleForm={toggleForm}
        >
            <VilkårSkjema
                vilkårSkjemaContext={vilkårSkjemaContext}
                visVurderesEtter={true}
                visSpørsmål={false}
                lagretVilkårResultat={lagretVilkårResultat}
                vilkårFraConfig={vilkårFraConfig}
                toggleForm={toggleForm}
                person={person}
                lesevisning={erLesevisning}
                settFokusPåLeggTilPeriodeKnapp={settFokusPåLeggTilPeriodeKnapp}
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
                <br />

                <RadioGroup
                    legend={
                        <Label>
                            {vilkårFraConfig.spørsmål ? vilkårFraConfig.spørsmål(person.type.toLowerCase()) : ''}
                        </Label>
                    }
                    value={skjema.felter.resultat.verdi}
                    error={skjema.visFeilmeldinger ? skjema.felter.resultat.feilmelding : ''}
                    readOnly={erLesevisning}
                >
                    <Radio
                        name={`${lagretVilkårResultat.vilkårType}_${lagretVilkårResultat.id}`}
                        value={Resultat.OPPFYLT}
                        onChange={() => {
                            skjema.felter.resultat.validerOgSettFelt(Resultat.OPPFYLT);
                            nullstillAvslagBegrunnelser();
                        }}
                    >
                        Ja
                    </Radio>
                    <Radio
                        name={`${lagretVilkårResultat.vilkårType}_${lagretVilkårResultat.id}`}
                        value={Resultat.IKKE_OPPFYLT}
                        onChange={() => {
                            skjema.felter.resultat.validerOgSettFelt(Resultat.IKKE_OPPFYLT);
                        }}
                    >
                        Nei
                    </Radio>
                    <Radio
                        name={`${lagretVilkårResultat.vilkårType}_${lagretVilkårResultat.id}`}
                        value={Resultat.IKKE_AKTUELT}
                        onChange={() => {
                            skjema.felter.resultat.validerOgSettFelt(Resultat.IKKE_AKTUELT);
                            nullstillAvslagBegrunnelser();
                        }}
                    >
                        Ikke aktuelt
                    </Radio>
                </RadioGroup>
            </VilkårSkjema>
        </VilkårTabellRad>
    );
};
