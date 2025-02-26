import React from 'react';

import styled from 'styled-components';

import { Alert, Label, Radio, RadioGroup } from '@navikt/ds-react';

import { useMedlemskapAnnenForelder } from './MedlemskapAnnenForelderContext';
import { useBehandling } from '../../../../../../context/behandlingContext/BehandlingContext';
import { Regelverk, Resultat } from '../../../../../../typer/vilkår';
import { useVilkårEkspanderbarRad } from '../../useVilkårEkspanderbarRad';
import VilkårEkspanderbarRad from '../../VilkårEkspanderbarRad';
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
    person,
}: MedlemskapAnnenForelderProps) => {
    const { vurderErLesevisning } = useBehandling();
    const erLesevisning = vurderErLesevisning();

    const { felter } = useMedlemskapAnnenForelder(vilkårResultat, person);
    const vilkårSkjemaContext = useVilkårSkjema(vilkårResultat, felter, person);

    const { toggleForm, ekspandertVilkår } = useVilkårEkspanderbarRad({
        vilkårHarEndringerSomIkkeErLagret: vilkårSkjemaContext.finnesEndringerSomIkkeErLagret,
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
            >
                <br />

                {vilkårSkjemaContext.skjema.felter.vurderesEtter.verdi ===
                    Regelverk.EØS_FORORDNINGEN && (
                    <>
                        <StyledAlert variant="info" inline>
                            Du må vurdere dette vilkåret når den andre forelderen er omfattet av
                            norsk lovgivning og søker har selvstendig rett
                        </StyledAlert>
                        <br />
                    </>
                )}

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
                        Ikke aktuelt - Bor ikke sammen
                    </Radio>
                </RadioGroup>
            </VilkårSkjema>
        </VilkårEkspanderbarRad>
    );
};
