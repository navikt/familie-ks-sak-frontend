import React from 'react';

import styled from 'styled-components';

import { Alert, Label, Radio, RadioGroup } from '@navikt/ds-react';

import { useMedlemskap } from './MedlemskapContext';
import { Regelverk, Resultat } from '../../../../../../../../typer/vilkår';
import { useBehandlingContext } from '../../../../../context/BehandlingContext';
import { useVilkårEkspanderbarRad } from '../../useVilkårEkspanderbarRad';
import { VilkårEkspanderbarRad } from '../../VilkårEkspanderbarRad';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';

type MedlemskapProps = IVilkårSkjemaBaseProps;

const StyledAlert = styled(Alert)`
    margin-top: 1rem;
`;

export const Medlemskap: React.FC<MedlemskapProps> = ({
    lagretVilkårResultat,
    vilkårFraConfig,
    person,
    settFokusPåLeggTilPeriodeKnapp,
}: MedlemskapProps) => {
    const { vurderErLesevisning } = useBehandlingContext();
    const erLesevisning = vurderErLesevisning();

    const { vilkårSkjemaContext, finnesEndringerSomIkkeErLagret, skalViseDatoVarsel } = useMedlemskap(
        lagretVilkårResultat,
        person
    );

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
                settFokusPåLeggTilPeriodeKnapp={settFokusPåLeggTilPeriodeKnapp}
                periodeChildren={
                    skalViseDatoVarsel && (
                        <StyledAlert inline variant={'warning'} size={'small'}>
                            Du må dobbeltsjekke at foreslått f.o.m dato er korrekt
                        </StyledAlert>
                    )
                }
            >
                <br />

                {skjema.felter.vurderesEtter.verdi === Regelverk.EØS_FORORDNINGEN && (
                    <>
                        <StyledAlert variant="info" inline>
                            Du må vurdere dette vilkåret når søker er omfattet av norsk lovgivning
                        </StyledAlert>
                        <br />
                    </>
                )}

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
                    {skjema.felter.vurderesEtter.verdi === Regelverk.EØS_FORORDNINGEN && (
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
                    )}
                </RadioGroup>
            </VilkårSkjema>
        </VilkårEkspanderbarRad>
    );
};
