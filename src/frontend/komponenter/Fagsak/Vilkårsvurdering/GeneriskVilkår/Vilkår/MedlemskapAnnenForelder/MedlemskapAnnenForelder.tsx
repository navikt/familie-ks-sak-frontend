import React from 'react';

import styled from 'styled-components';

import { Radio } from 'nav-frontend-skjema';

import { Alert, Label } from '@navikt/ds-react';
import { FamilieRadioGruppe } from '@navikt/familie-form-elements';

import { useMedlemskapAnnenForelder } from './MedlemskapAnnenForelderContext';
import { Resultat, resultater } from '../../../../../../typer/vilkår';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useVilkårSkjema } from '../../VilkårSkjemaContext';

type MedlemskapAnnenForelderProps = IVilkårSkjemaBaseProps;

const StyledAlert = styled(Alert)`
    margin-top: 1rem;
`;

export const MedlemskapAnnenForelder: React.FC<MedlemskapAnnenForelderProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    toggleForm,
    person,
    lesevisning,
}: MedlemskapAnnenForelderProps) => {
    const { felter } = useMedlemskapAnnenForelder(vilkårResultat, person);
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
        >
            <br />

            <StyledAlert variant="info" inline>
                Du må vurdere dette vilkåret når den andre forelderen er omfattet av norsk
                lovgivning og søker har selvstendig rett
            </StyledAlert>

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
                    label={'Ikke aktuelt - Bor ikke sammen'}
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
