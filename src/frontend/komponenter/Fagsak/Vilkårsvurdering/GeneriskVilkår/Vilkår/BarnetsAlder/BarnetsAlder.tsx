import React from 'react';

import { Label, Radio, RadioGroup } from '@navikt/ds-react';

import { muligeUtdypendeVilkårsvurderinger, useBarnetsAlder } from './BarnetsAlderContext';
import { Resultat, VilkårRegelsett } from '../../../../../../typer/vilkår';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useVilkårSkjema } from '../../VilkårSkjemaContext';

type BarnetsAlderProps = IVilkårSkjemaBaseProps;

const hentSpørsmålBasertPåREgelsett = (regelsett: VilkårRegelsett) => {
    switch (regelsett) {
        case VilkårRegelsett.LOV_AUGUST_2021:
            return 'Er barnet mellom 1 og 2 år eller adoptert?';
        case VilkårRegelsett.LOV_AUGUST_2024:
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
    const spørsmål = hentSpørsmålBasertPåREgelsett(vilkårResultat.regelsett);

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
