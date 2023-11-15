import React from 'react';

import styled from 'styled-components';

import { Radio } from 'nav-frontend-skjema';

import { Alert, Label } from '@navikt/ds-react';
import { FamilieRadioGruppe } from '@navikt/familie-form-elements';

import { useMedlemskap } from './MedlemskapContext';
import { Resultat, resultater } from '../../../../../../typer/vilkår';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useVilkårSkjema } from '../../VilkårSkjemaContext';

type MedlemskapProps = IVilkårSkjemaBaseProps;

const StyledAlert = styled(Alert)`
    margin-top: 1rem;
`;

export const Medlemskap: React.FC<MedlemskapProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    toggleForm,
    person,
    lesevisning,
}: MedlemskapProps) => {
    const { felter, skalViseDatoVarsel } = useMedlemskap(vilkårResultat, person);
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
                value={resultater[felter.resultat.verdi]}
                error={
                    vilkårSkjemaContext.skjema.visFeilmeldinger
                        ? vilkårSkjemaContext.skjema.felter.resultat.feilmelding
                        : ''
                }
                erLesevisning={lesevisning}
            >
                <Radio
                    label={'Ja'}
                    name={`${vilkårResultat.vilkårType}_${vilkårResultat.id}`}
                    checked={vilkårSkjemaContext.skjema.felter.resultat.verdi === Resultat.OPPFYLT}
                    onChange={() => {
                        vilkårSkjemaContext.skjema.felter.resultat.validerOgSettFelt(
                            Resultat.OPPFYLT
                        );
                        nullstillAvslagBegrunnelser();
                    }}
                />
                <Radio
                    label={'Nei'}
                    name={`${vilkårResultat.vilkårType}_${vilkårResultat.id}`}
                    checked={
                        vilkårSkjemaContext.skjema.felter.resultat.verdi === Resultat.IKKE_OPPFYLT
                    }
                    onChange={() => {
                        vilkårSkjemaContext.skjema.felter.resultat.validerOgSettFelt(
                            Resultat.IKKE_OPPFYLT
                        );
                    }}
                />
                <Radio
                    label={'Ikke aktuelt'}
                    name={`${vilkårResultat.vilkårType}_${vilkårResultat.id}`}
                    checked={
                        vilkårSkjemaContext.skjema.felter.resultat.verdi === Resultat.IKKE_AKTUELT
                    }
                    onChange={() => {
                        vilkårSkjemaContext.skjema.felter.resultat.validerOgSettFelt(
                            Resultat.IKKE_AKTUELT
                        );
                        nullstillAvslagBegrunnelser();
                    }}
                />
            </FamilieRadioGruppe>
        </VilkårSkjema>
    );
};
