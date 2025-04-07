import React, { useEffect } from 'react';

import styled from 'styled-components';

import { BodyShort, Checkbox, Radio, RadioGroup, TextField } from '@navikt/ds-react';

import { muligeUtdypendeVilkårsvurderinger, useBarnehageplass } from './BarnehageplassContext';
import { antallTimerKvalifiserer } from './BarnehageplassUtils';
import { useBehandling } from '../../../../../../../context/behandlingContext/BehandlingContext';
import { Resultat, UtdypendeVilkårsvurderingGenerell } from '../../../../../../../typer/vilkår';
import { useVilkårEkspanderbarRad } from '../../useVilkårEkspanderbarRad';
import { VilkårEkspanderbarRad } from '../../VilkårEkspanderbarRad';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';

const StyledTextField = styled(TextField)`
    margin-bottom: 1rem;
`;

type BarnehageplassProps = IVilkårSkjemaBaseProps;

export const Barnehageplass: React.FC<BarnehageplassProps> = ({
    lagretVilkårResultat,
    vilkårFraConfig,
    person,
    settFokusPåLeggTilPeriodeKnapp,
}: BarnehageplassProps) => {
    const { vurderErLesevisning } = useBehandling();
    const erLesevisning = vurderErLesevisning();

    const {
        vilkårSkjemaContext,
        finnesEndringerSomIkkeErLagret,
        harBarnehageplass,
        settHarBarnehageplass,
    } = useBarnehageplass(lagretVilkårResultat, person);

    const skjema = vilkårSkjemaContext.skjema;

    const { toggleForm, erVilkårEkspandert } = useVilkårEkspanderbarRad({
        vilkårHarEndringerSomIkkeErLagret: finnesEndringerSomIkkeErLagret,
        lagretVilkårResultat,
    });

    const oppdaterResultat = (barnehageplass: boolean, antallTimer: string) => {
        if (!barnehageplass) {
            if (
                skjema.felter.utdypendeVilkårsvurdering.verdi.find(
                    utdypende => utdypende === UtdypendeVilkårsvurderingGenerell.SOMMERFERIE
                )
            ) {
                skjema.felter.resultat.validerOgSettFelt(Resultat.IKKE_OPPFYLT);
            } else {
                skjema.felter.resultat.validerOgSettFelt(Resultat.OPPFYLT);
            }
        } else {
            if (antallTimerKvalifiserer(Number(antallTimer))) {
                skjema.felter.resultat.validerOgSettFelt(Resultat.OPPFYLT);
            } else {
                skjema.felter.resultat.validerOgSettFelt(Resultat.IKKE_OPPFYLT);
            }
        }
    };

    const onAntallTimerOppdatert = (antallTimer: string) => {
        oppdaterResultat(harBarnehageplass, antallTimer);
    };

    const onBarnehageplassOppdatert = (barnehageplass: boolean) => {
        settHarBarnehageplass(barnehageplass);
        oppdaterResultat(barnehageplass, skjema.felter.antallTimer.verdi);
    };

    useEffect(() => {
        oppdaterResultat(harBarnehageplass, skjema.felter.antallTimer.verdi);
    }, [skjema.felter.utdypendeVilkårsvurdering]);

    return (
        <VilkårEkspanderbarRad
            lagretVilkårResultat={lagretVilkårResultat}
            erVilkårEkspandert={erVilkårEkspandert}
            toggleForm={toggleForm}
        >
            <VilkårSkjema
                vilkårSkjemaContext={vilkårSkjemaContext}
                visVurderesEtter={false}
                visSpørsmål={false}
                muligeUtdypendeVilkårsvurderinger={
                    harBarnehageplass ? [] : muligeUtdypendeVilkårsvurderinger
                }
                lagretVilkårResultat={lagretVilkårResultat}
                vilkårFraConfig={vilkårFraConfig}
                toggleForm={toggleForm}
                person={person}
                lesevisning={erLesevisning}
                settFokusPåLeggTilPeriodeKnapp={settFokusPåLeggTilPeriodeKnapp}
                periodeChildren={
                    skjema.felter.periode.verdi.tom && (
                        <>
                            {skjema.felter.søkerHarMeldtFraOmBarnehageplass.verdi && (
                                <BodyShort as={'em'} size="small">
                                    Merk at tom-dato skal være dagen før barnehagestart
                                </BodyShort>
                            )}
                            <Checkbox
                                defaultChecked={
                                    skjema.felter.søkerHarMeldtFraOmBarnehageplass.verdi
                                }
                                onChange={event => {
                                    skjema.felter.søkerHarMeldtFraOmBarnehageplass.validerOgSettFelt(
                                        event.target.checked
                                    );
                                }}
                            >
                                Søker har meldt fra om barnehageplass
                            </Checkbox>
                        </>
                    )
                }
            >
                <RadioGroup
                    legend={vilkårFraConfig.spørsmål ? vilkårFraConfig.spørsmål() : ''}
                    value={
                        skjema.felter.resultat.verdi !== Resultat.IKKE_VURDERT
                            ? harBarnehageplass
                            : undefined
                    }
                    error={skjema.visFeilmeldinger ? skjema.felter.resultat.feilmelding : ''}
                    readOnly={erLesevisning}
                >
                    <Radio
                        name={`${lagretVilkårResultat.vilkårType}_${lagretVilkårResultat.id}`}
                        value={true}
                        onChange={() => {
                            onBarnehageplassOppdatert(true);
                        }}
                    >
                        Ja
                    </Radio>
                    <Radio
                        name={`${lagretVilkårResultat.vilkårType}_${lagretVilkårResultat.id}`}
                        value={false}
                        onChange={() => {
                            skjema.felter.antallTimer.validerOgSettFelt('');
                            onBarnehageplassOppdatert(false);
                        }}
                    >
                        Nei
                    </Radio>
                </RadioGroup>
                {harBarnehageplass && (
                    <StyledTextField
                        label={'Antall timer'}
                        type={'number'}
                        readOnly={erLesevisning}
                        value={skjema.felter.antallTimer.verdi}
                        onChange={event => {
                            skjema.felter.antallTimer.validerOgSettFelt(event.target.value);
                            onAntallTimerOppdatert(event.target.value);
                        }}
                        error={skjema.visFeilmeldinger ? skjema.felter.antallTimer.feilmelding : ''}
                    />
                )}
            </VilkårSkjema>
        </VilkårEkspanderbarRad>
    );
};
