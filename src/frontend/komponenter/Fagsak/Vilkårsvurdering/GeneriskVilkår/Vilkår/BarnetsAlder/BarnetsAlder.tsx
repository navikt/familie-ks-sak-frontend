import React from 'react';

import { isBefore } from 'date-fns';

import { Label, Radio, RadioGroup } from '@navikt/ds-react';

import { muligeUtdypendeVilkårsvurderinger, useBarnetsAlder } from './BarnetsAlderContext';
import { useApp } from '../../../../../../context/AppContext';
import { ToggleNavn } from '../../../../../../typer/toggles';
import { Resultat } from '../../../../../../typer/vilkår';
import {
    datoForLovendringAugust24,
    type IIsoDatoPeriode,
    isoStringTilDateEllerUndefinedHvisUgyldigDato,
} from '../../../../../../utils/dato';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useVilkårSkjema } from '../../VilkårSkjemaContext';

type BarnetsAlderProps = IVilkårSkjemaBaseProps;

const hentSpørsmålForPeriode = (periode: IIsoDatoPeriode, erLovendringTogglePå: boolean) => {
    const fraOgMedDato = isoStringTilDateEllerUndefinedHvisUgyldigDato(periode.fom);
    const fraOgMedErFørLovendring =
        fraOgMedDato && isBefore(fraOgMedDato, datoForLovendringAugust24);
    if (fraOgMedErFørLovendring || !erLovendringTogglePå) {
        return 'Er barnet mellom 1 og 2 år eller adoptert?';
    } else {
        return 'Er barnet mellom 13 og 19 måneder eller adoptert?';
    }
};

export const BarnetsAlder: React.FC<BarnetsAlderProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    toggleForm,
    person,
    lesevisning,
}: BarnetsAlderProps) => {
    const { felter } = useBarnetsAlder(vilkårResultat, person);
    const vilkårSkjemaContext = useVilkårSkjema(vilkårResultat, felter, person, toggleForm);
    const { toggles } = useApp();
    const erLovendringTogglePå = toggles[ToggleNavn.lovendring7MndNyeBehandlinger];
    const spørsmål = hentSpørsmålForPeriode(
        vilkårSkjemaContext.skjema.felter.periode.verdi,
        erLovendringTogglePå
    );

    return (
        <VilkårSkjema
            vilkårSkjemaContext={vilkårSkjemaContext}
            visVurderesEtter={false}
            visSpørsmål={false}
            muligeUtdypendeVilkårsvurderinger={muligeUtdypendeVilkårsvurderinger}
            vilkårResultat={vilkårResultat}
            vilkårFraConfig={vilkårFraConfig}
            toggleForm={toggleForm}
            person={person}
            lesevisning={lesevisning}
        >
            <RadioGroup
                readOnly={lesevisning}
                value={vilkårSkjemaContext.skjema.felter.resultat.verdi}
                legend={<Label>{spørsmål}</Label>}
                error={
                    vilkårSkjemaContext.skjema.visFeilmeldinger
                        ? vilkårSkjemaContext.skjema.felter.resultat.feilmelding
                        : ''
                }
            >
                <Radio
                    name={`${vilkårResultat.vilkårType}_${vilkårResultat.id}`}
                    value={Resultat.OPPFYLT}
                    onChange={() => {
                        vilkårSkjemaContext.skjema.felter.resultat.validerOgSettFelt(
                            Resultat.OPPFYLT
                        );
                        vilkårSkjemaContext.skjema.felter.erEksplisittAvslagPåSøknad.validerOgSettFelt(
                            false
                        );
                        vilkårSkjemaContext.skjema.felter.avslagBegrunnelser.validerOgSettFelt([]);
                    }}
                >
                    Ja
                </Radio>
                <Radio
                    name={`${vilkårResultat.vilkårType}_${vilkårResultat.id}`}
                    value={Resultat.IKKE_OPPFYLT}
                    onChange={() =>
                        vilkårSkjemaContext.skjema.felter.resultat.validerOgSettFelt(
                            Resultat.IKKE_OPPFYLT
                        )
                    }
                >
                    Nei
                </Radio>
            </RadioGroup>
        </VilkårSkjema>
    );
};
