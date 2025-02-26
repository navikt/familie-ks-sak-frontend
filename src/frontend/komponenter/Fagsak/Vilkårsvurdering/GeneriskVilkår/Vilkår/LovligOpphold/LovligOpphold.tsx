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
import { useVilkårSkjema } from '../../VilkårSkjemaContext';

type LovligOppholdProps = IVilkårSkjemaBaseProps;

const StyledAlert = styled(Alert)`
    margin-top: 1rem;
`;

export const LovligOpphold: React.FC<LovligOppholdProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    person,
}: LovligOppholdProps) => {
    const { vurderErLesevisning } = useBehandling();
    const erLesevisning = vurderErLesevisning();

    const { felter, skalViseDatoVarsel } = useLovligOpphold(vilkårResultat, person);
    const vilkårSkjemaContext = useVilkårSkjema(vilkårResultat, felter, person);

    const vilkårHarEndringerSomIkkeErLagret = () => {
        return true;
    };

    const { toggleForm, ekspandertVilkår } = useVilkårEkspanderbarRad({
        vilkårHarEndringerSomIkkeErLagret,
        lagretVilkårResultat: vilkårResultat,
    });

    const nullstillAvslagBegrunnelser = () => {
        vilkårSkjemaContext.skjema.felter.erEksplisittAvslagPåSøknad.validerOgSettFelt(false);
        vilkårSkjemaContext.skjema.felter.avslagBegrunnelser.validerOgSettFelt([]);
    };
    return (
        <VilkårEkspanderbarRad
            vilkårResultat={vilkårResultat}
            ekspandertVilkår={ekspandertVilkår}
            toggleForm={toggleForm}
        >
            <VilkårSkjema
                vilkårSkjemaContext={vilkårSkjemaContext}
                visVurderesEtter={true}
                visSpørsmål={false}
                vilkårResultat={vilkårResultat}
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
                    value={felter.resultat.verdi}
                    error={
                        vilkårSkjemaContext.skjema.visFeilmeldinger
                            ? vilkårSkjemaContext.skjema.felter.resultat.feilmelding
                            : ''
                    }
                    readOnly={erLesevisning}
                >
                    <Radio
                        name={`${vilkårResultat.vilkårType}_${vilkårResultat.id}`}
                        value={Resultat.OPPFYLT}
                        onChange={() => {
                            vilkårSkjemaContext.skjema.felter.resultat.validerOgSettFelt(
                                Resultat.OPPFYLT
                            );
                            nullstillAvslagBegrunnelser();
                        }}
                    >
                        Ja
                    </Radio>
                    <Radio
                        name={`${vilkårResultat.vilkårType}_${vilkårResultat.id}`}
                        value={Resultat.IKKE_OPPFYLT}
                        onChange={() => {
                            vilkårSkjemaContext.skjema.felter.resultat.validerOgSettFelt(
                                Resultat.IKKE_OPPFYLT
                            );
                        }}
                    >
                        Nei
                    </Radio>
                    <Radio
                        name={`${vilkårResultat.vilkårType}_${vilkårResultat.id}`}
                        value={Resultat.IKKE_AKTUELT}
                        onChange={() => {
                            vilkårSkjemaContext.skjema.felter.resultat.validerOgSettFelt(
                                Resultat.IKKE_AKTUELT
                            );
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
