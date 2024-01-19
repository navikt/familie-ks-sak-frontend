import React from 'react';

import styled from 'styled-components';

import { Alert, Label, Radio } from '@navikt/ds-react';
import { FamilieRadioGruppe } from '@navikt/familie-form-elements';

import { useLovligOpphold } from './LovligOppholdContext';
import { Resultat } from '../../../../../../typer/vilkår';
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
    toggleForm,
    person,
    lesevisning,
}: LovligOppholdProps) => {
    const { felter, skalViseDatoVarsel } = useLovligOpphold(vilkårResultat, person);
    const vilkårSkjemaContext = useVilkårSkjema(vilkårResultat, felter, person, toggleForm);
    const nullstillAvslagBegrunnelser = () => {
        vilkårSkjemaContext.skjema.felter.erEksplisittAvslagPåSøknad.validerOgSettFelt(false);
        vilkårSkjemaContext.skjema.felter.avslagBegrunnelser.validerOgSettFelt([]);
    };
    return (
        <VilkårSkjema
            vilkårSkjemaContext={vilkårSkjemaContext}
            visVurderesEtter={true}
            visSpørsmål={false}
            vilkårResultat={vilkårResultat}
            vilkårFraConfig={vilkårFraConfig}
            toggleForm={toggleForm}
            person={person}
            lesevisning={lesevisning}
            periodeChildren={
                skalViseDatoVarsel && (
                    <StyledAlert inline variant={'warning'} size={'small'}>
                        Du må dobbeltsjekke at foreslått f.o.m dato er korrekt
                    </StyledAlert>
                )
            }
        >
            <br />

            <FamilieRadioGruppe
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
                erLesevisning={lesevisning}
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
            </FamilieRadioGruppe>
        </VilkårSkjema>
    );
};
