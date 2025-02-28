import React from 'react';

import styled from 'styled-components';

import { Alert, Label, Radio, RadioGroup } from '@navikt/ds-react';

import { useLovligOpphold } from './LovligOppholdContext';
import { useBehandling } from '../../../../../../context/behandlingContext/BehandlingContext';
import { Resultat } from '../../../../../../typer/vilkår';
import { useVilkårEkspanderbarRad } from '../../useVilkårEkspanderbarRad';
import VilkårEkspanderbarRad from '../../VilkårEkspanderbarRad';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';

type LovligOppholdProps = IVilkårSkjemaBaseProps;

const StyledAlert = styled(Alert)`
    margin-top: 1rem;
`;

export const LovligOpphold: React.FC<LovligOppholdProps> = ({
    lagretVilkårResultat,
    vilkårFraConfig,
    person,
}: LovligOppholdProps) => {
    const { vurderErLesevisning } = useBehandling();
    const erLesevisning = vurderErLesevisning();

    const { vilkårSkjemaContext, finnesEndringerSomIkkeErLagret, skalViseDatoVarsel } =
        useLovligOpphold(lagretVilkårResultat, person);

    const skjema = vilkårSkjemaContext.skjema;

    const { toggleForm, erVilkårEkspandert } = useVilkårEkspanderbarRad({
        vilkårHarEndringerSomIkkeErLagret: finnesEndringerSomIkkeErLagret,
        lagretVilkårResultat,
    });

    const nullstillAvslagBegrunnelser = () => {
        skjema.felter.erEksplisittAvslagPåSøknad.validerOgSettFelt(false);
        skjema.felter.avslagBegrunnelser.validerOgSettFelt([]);
    };
    return (
        <VilkårEkspanderbarRad
            lagretVilkårResultat={lagretVilkårResultat}
            erVilkårEkspandert={erVilkårEkspandert}
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
                periodeChildren={
                    skalViseDatoVarsel && (
                        <StyledAlert inline variant={'warning'} size={'small'}>
                            Du må dobbeltsjekke at foreslått f.o.m dato er korrekt
                        </StyledAlert>
                    )
                }
            >
                <br />

                <RadioGroup
                    legend={
                        <Label>
                            {vilkårFraConfig.spørsmål
                                ? vilkårFraConfig.spørsmål(person.type.toLowerCase())
                                : ''}
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
        </VilkårEkspanderbarRad>
    );
};
