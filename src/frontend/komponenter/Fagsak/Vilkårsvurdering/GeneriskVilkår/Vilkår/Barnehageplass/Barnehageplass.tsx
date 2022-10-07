import React, { useState } from 'react';

import { Radio } from 'nav-frontend-skjema';

import { FamilieInput, FamilieRadioGruppe } from '@navikt/familie-form-elements';

import { Resultat } from '../../../../../../typer/vilkår';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useVilkårSkjema } from '../../VilkårSkjemaContext';
import { useBarnehageplass } from './BarnehageplassContext';

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

    const antallTimerKvalifiserer = (antallTimer: number) => {
        const kvalifiserer = antallTimer > 0 && antallTimer < 33;
        return kvalifiserer;
    };

    const [harBarnehageplass, settHarBarnehageplass] = useState(
        vilkårSkjemaContext.skjema.felter.resultat.verdi === Resultat.IKKE_OPPFYLT ||
            (vilkårSkjemaContext.skjema.felter.resultat.verdi === Resultat.OPPFYLT &&
                antallTimerKvalifiserer(
                    Number(vilkårSkjemaContext.skjema.felter.antallTimer.verdi)
                ))
    );

    const oppdaterResultat = (barnehageplass: boolean, antallTimer: string) => {
        if (!barnehageplass) {
            vilkårSkjemaContext.skjema.felter.resultat.validerOgSettFelt(Resultat.OPPFYLT);
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

    return (
        <VilkårSkjema
            vilkårSkjemaContext={vilkårSkjemaContext}
            visVurderesEtter={false}
            visSpørsmål={false}
            vilkårResultat={vilkårResultat}
            vilkårFraConfig={vilkårFraConfig}
            toggleForm={toggleForm}
            person={person}
            lesevisning={lesevisning}
        >
            <FamilieRadioGruppe
                legend={vilkårFraConfig.spørsmål ? vilkårFraConfig.spørsmål() : ''}
                feil={
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
                <FamilieInput
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
                    feil={
                        vilkårSkjemaContext.skjema.visFeilmeldinger
                            ? vilkårSkjemaContext.skjema.felter.antallTimer.feilmelding
                            : ''
                    }
                />
            )}
        </VilkårSkjema>
    );
};
