import React from 'react';

import { Radio } from 'nav-frontend-skjema';

import { Label } from '@navikt/ds-react';
import { FamilieRadioGruppe } from '@navikt/familie-form-elements';

import { useMedlemskapAnnenForelder } from './MedlemskapAnnenForelderContext';
import { Resultat, resultater } from '../../../../../../typer/vilkår';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useVilkårSkjema } from '../../VilkårSkjemaContext';

type MedlemskapAnnenForelderProps = IVilkårSkjemaBaseProps;

export const MedlemskapAnnenForelder: React.FC<MedlemskapAnnenForelderProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    toggleForm,
    person,
    lesevisning,
}: MedlemskapAnnenForelderProps) => {
    const { felter } = useMedlemskapAnnenForelder(vilkårResultat, person);
    const vilkårSkjemaContext = useVilkårSkjema(vilkårResultat, felter, person, toggleForm);
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
                    label={'Bor ikke sammen'}
                    name={`${vilkårResultat.vilkårType}_${vilkårResultat.id}`}
                    checked={
                        vilkårSkjemaContext.skjema.felter.resultat.verdi === Resultat.IKKE_AKTUELT
                    }
                    onChange={() => {
                        vilkårSkjemaContext.skjema.felter.resultat.validerOgSettFelt(
                            Resultat.IKKE_AKTUELT
                        );
                    }}
                />
            </FamilieRadioGruppe>
        </VilkårSkjema>
    );
};
