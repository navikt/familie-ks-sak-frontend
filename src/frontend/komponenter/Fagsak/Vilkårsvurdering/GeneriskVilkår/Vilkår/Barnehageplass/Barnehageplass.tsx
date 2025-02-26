import React, { useEffect, useState } from 'react';

import styled from 'styled-components';

import { BodyShort, Checkbox, Radio, RadioGroup, TextField } from '@navikt/ds-react';

import { muligeUtdypendeVilkårsvurderinger, useBarnehageplass } from './BarnehageplassContext';
import {
    antallTimerKvalifiserer,
    vilkårIkkeOppfyltOgUtdypendeIkkeSommerferie,
    vilkårOppfyltOgAntallTimerKvalifiserer,
} from './BarnehageplassUtils';
import { useBehandling } from '../../../../../../context/behandlingContext/BehandlingContext';
import { Resultat, UtdypendeVilkårsvurderingGenerell } from '../../../../../../typer/vilkår';
import { useVilkårEkspanderbarRad } from '../../useVilkårEkspanderbarRad';
import VilkårEkspanderbarRad from '../../VilkårEkspanderbarRad';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useVilkårSkjema } from '../../VilkårSkjemaContext';

const StyledTextField = styled(TextField)`
    margin-bottom: 1rem;
`;

type BarnehageplassProps = IVilkårSkjemaBaseProps;

export const Barnehageplass: React.FC<BarnehageplassProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    person,
}: BarnehageplassProps) => {
    const { vurderErLesevisning } = useBehandling();
    const erLesevisning = vurderErLesevisning();

    const { felter } = useBarnehageplass(vilkårResultat, person);
    const vilkårSkjemaContext = useVilkårSkjema(vilkårResultat, felter, person);

    const [harBarnehageplass, settHarBarnehageplass] = useState(
        vilkårIkkeOppfyltOgUtdypendeIkkeSommerferie(vilkårSkjemaContext.skjema) ||
            vilkårOppfyltOgAntallTimerKvalifiserer(vilkårSkjemaContext.skjema)
    );

    const vilkårHarEndringerSomIkkeErLagret = () => {
        return true;
    };

    const { toggleForm, ekspandertVilkår } = useVilkårEkspanderbarRad({
        vilkårHarEndringerSomIkkeErLagret,
        lagretVilkårResultat: vilkårResultat,
    });

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
        <VilkårEkspanderbarRad
            vilkårResultat={vilkårResultat}
            ekspandertVilkår={ekspandertVilkår}
            toggleForm={toggleForm}
        >
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
                lesevisning={erLesevisning}
                periodeChildren={
                    felter.periode.verdi.tom && (
                        <>
                            {felter.søkerHarMeldtFraOmBarnehageplass.verdi && (
                                <BodyShort as={'em'} size="small">
                                    Merk at tom-dato skal være dagen før barnehagestart
                                </BodyShort>
                            )}
                            <Checkbox
                                defaultChecked={felter.søkerHarMeldtFraOmBarnehageplass.verdi}
                                onChange={event => {
                                    felter.søkerHarMeldtFraOmBarnehageplass.validerOgSettFelt(
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
                        vilkårSkjemaContext.skjema.felter.resultat.verdi !== Resultat.IKKE_VURDERT
                            ? harBarnehageplass
                            : undefined
                    }
                    error={
                        vilkårSkjemaContext.skjema.visFeilmeldinger
                            ? vilkårSkjemaContext.skjema.felter.resultat.feilmelding
                            : ''
                    }
                    readOnly={erLesevisning}
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
                    <StyledTextField
                        label={'Antall timer'}
                        type={'number'}
                        readOnly={erLesevisning}
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
        </VilkårEkspanderbarRad>
    );
};
