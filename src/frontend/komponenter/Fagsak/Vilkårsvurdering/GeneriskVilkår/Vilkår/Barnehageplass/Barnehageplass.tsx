import React, { useState, useEffect } from 'react';

import styled from 'styled-components';

import { Radio } from 'nav-frontend-skjema';

import { FamilieInput, FamilieRadioGruppe } from '@navikt/familie-form-elements';

import { Resultat, UtdypendeVilkårsvurderingGenerell } from '../../../../../../typer/vilkår';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useVilkårSkjema } from '../../VilkårSkjemaContext';
import { muligeUtdypendeVilkårsvurderinger, useBarnehageplass } from './BarnehageplassContext';
import {
    antallTimerKvalifiserer,
    vilkårIkkeOppfyltOgUtdypendeIkkeSommerferie,
    vilkårOppfyltOgAntallTimerKvalifiserer,
} from './BarnehageplassUtils';

const StyledFamilieInput = styled(FamilieInput)`
    margin-bottom: 1rem;
`;

type BarnehageplassProps = IVilkårSkjemaBaseProps;

export const Barnehageplass: React.FC<BarnehageplassProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    toggleForm,
    person,
    lesevisning,
}: BarnehageplassProps) => {
    const { felter } = useBarnehageplass(vilkårResultat, person);
    const vilkårSkjemaContext = useVilkårSkjema(vilkårResultat, felter, person, toggleForm);

    const [harBarnehageplass, settHarBarnehageplass] = useState(
        vilkårIkkeOppfyltOgUtdypendeIkkeSommerferie(vilkårSkjemaContext.skjema) ||
            vilkårOppfyltOgAntallTimerKvalifiserer(vilkårSkjemaContext.skjema)
    );

    const oppdaterResultat = (barnehageplass: boolean, antallTimer: string) => {
        if (!barnehageplass) {
            if (
                vilkårSkjemaContext.skjema.felter.utdypendeVilkårsvurdering.verdi.find(
                    utdypende => utdypende === UtdypendeVilkårsvurderingGenerell.SOMMERFERIE
                )
            ) {
                vilkårSkjemaContext.skjema.felter.resultat.validerOgSettFelt(Resultat.IKKE_OPPFYLT);
            } else {
                vilkårSkjemaContext.skjema.felter.resultat.validerOgSettFelt(Resultat.OPPFYLT);
            }
        } else {
            if (antallTimerKvalifiserer(Number(antallTimer))) {
                vilkårSkjemaContext.skjema.felter.resultat.validerOgSettFelt(Resultat.OPPFYLT);
            } else {
                vilkårSkjemaContext.skjema.felter.resultat.validerOgSettFelt(Resultat.IKKE_OPPFYLT);
            }
        }
    };

    const onAntallTimerOppdatert = (antallTimer: string) => {
        oppdaterResultat(harBarnehageplass, antallTimer);
    };

    const onBarnehageplassOppdatert = (barnehageplass: boolean) => {
        settHarBarnehageplass(barnehageplass);
        oppdaterResultat(barnehageplass, vilkårSkjemaContext.skjema.felter.antallTimer.verdi);
    };

    useEffect(() => {
        oppdaterResultat(harBarnehageplass, vilkårSkjemaContext.skjema.felter.antallTimer.verdi);
    }, [vilkårSkjemaContext.skjema.felter.utdypendeVilkårsvurdering]);

    return (
        <VilkårSkjema
            vilkårSkjemaContext={vilkårSkjemaContext}
            visVurderesEtter={false}
            visSpørsmål={true}
            muligeUtdypendeVilkårsvurderinger={
                harBarnehageplass ? [] : muligeUtdypendeVilkårsvurderinger
            }
            vilkårResultat={vilkårResultat}
            vilkårFraConfig={vilkårFraConfig}
            toggleForm={toggleForm}
            person={person}
            lesevisning={lesevisning}
        >
            <FamilieRadioGruppe
                legend={vilkårFraConfig.spørsmål ? vilkårFraConfig.spørsmål() : ''}
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
                    checked={
                        vilkårSkjemaContext.skjema.felter.resultat.verdi !==
                            Resultat.IKKE_VURDERT && harBarnehageplass
                    }
                    onChange={() => {
                        onBarnehageplassOppdatert(true);
                    }}
                />
                <Radio
                    label={'Nei'}
                    name={`${vilkårResultat.vilkårType}_${vilkårResultat.id}`}
                    checked={
                        vilkårSkjemaContext.skjema.felter.resultat.verdi !==
                            Resultat.IKKE_VURDERT && !harBarnehageplass
                    }
                    onChange={() => {
                        vilkårSkjemaContext.skjema.felter.antallTimer.validerOgSettFelt('');
                        onBarnehageplassOppdatert(false);
                    }}
                />
            </FamilieRadioGruppe>
            {harBarnehageplass && (
                <StyledFamilieInput
                    label={'Antall timer'}
                    type={'number'}
                    erLesevisning={lesevisning}
                    value={vilkårSkjemaContext.skjema.felter.antallTimer.verdi}
                    onChange={event => {
                        vilkårSkjemaContext.skjema.felter.antallTimer.validerOgSettFelt(
                            event.target.value
                        );
                        onAntallTimerOppdatert(event.target.value);
                    }}
                    error={
                        vilkårSkjemaContext.skjema.visFeilmeldinger
                            ? vilkårSkjemaContext.skjema.felter.antallTimer.feilmelding
                            : ''
                    }
                />
            )}
        </VilkårSkjema>
    );
};
