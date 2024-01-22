import React, { useEffect, useState } from 'react';

import styled from 'styled-components';

import { Radio, RadioGroup } from '@navikt/ds-react';
import { FamilieInput } from '@navikt/familie-form-elements';

import { muligeUtdypendeVilkårsvurderinger, useBarnehageplass } from './BarnehageplassContext';
import {
    antallTimerKvalifiserer,
    vilkårIkkeOppfyltOgUtdypendeIkkeSommerferie,
    vilkårOppfyltOgAntallTimerKvalifiserer,
} from './BarnehageplassUtils';
import { Resultat, UtdypendeVilkårsvurderingGenerell } from '../../../../../../typer/vilkår';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useVilkårSkjema } from '../../VilkårSkjemaContext';

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

    const skalKrysseAvPåJaForBarnehageplass =
        vilkårSkjemaContext.skjema.felter.resultat.verdi !== Resultat.IKKE_VURDERT &&
        harBarnehageplass;

    return (
        <VilkårSkjema
            vilkårSkjemaContext={vilkårSkjemaContext}
            visVurderesEtter={false}
            visSpørsmål={false}
            muligeUtdypendeVilkårsvurderinger={
                harBarnehageplass ? [] : muligeUtdypendeVilkårsvurderinger
            }
            vilkårResultat={vilkårResultat}
            vilkårFraConfig={vilkårFraConfig}
            toggleForm={toggleForm}
            person={person}
            lesevisning={lesevisning}
        >
            <RadioGroup
                legend={vilkårFraConfig.spørsmål ? vilkårFraConfig.spørsmål() : ''}
                value={skalKrysseAvPåJaForBarnehageplass}
                error={
                    vilkårSkjemaContext.skjema.visFeilmeldinger
                        ? vilkårSkjemaContext.skjema.felter.resultat.feilmelding
                        : ''
                }
                readOnly={lesevisning}
            >
                <Radio
                    name={`${vilkårResultat.vilkårType}_${vilkårResultat.id}`}
                    value={true}
                    onChange={() => {
                        onBarnehageplassOppdatert(true);
                    }}
                >
                    Ja
                </Radio>
                <Radio
                    name={`${vilkårResultat.vilkårType}_${vilkårResultat.id}`}
                    value={false}
                    onChange={() => {
                        vilkårSkjemaContext.skjema.felter.antallTimer.validerOgSettFelt('');
                        onBarnehageplassOppdatert(false);
                    }}
                >
                    Nei
                </Radio>
            </RadioGroup>
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
