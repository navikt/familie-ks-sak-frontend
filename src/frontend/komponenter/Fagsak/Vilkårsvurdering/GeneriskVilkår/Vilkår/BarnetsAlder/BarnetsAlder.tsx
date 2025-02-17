import React from 'react';

import { isBefore } from 'date-fns';

import { Label, Radio, RadioGroup } from '@navikt/ds-react';

import { muligeUtdypendeVilkårsvurderinger, useBarnetsAlder } from './BarnetsAlderContext';
import { useApp } from '../../../../../../context/AppContext';
import { Lovverk } from '../../../../../../typer/lovverk';
import { ToggleNavn } from '../../../../../../typer/toggles';
import { Resultat } from '../../../../../../typer/vilkår';
import {
    datoForLovendringAugust24,
    type IIsoDatoPeriode,
    isoStringTilDate,
    isoStringTilDateEllerUndefinedHvisUgyldigDato,
} from '../../../../../../utils/dato';
import { utledLovverk } from '../../../../../../utils/lovverk';
import Datovelger from '../../../../../Felleskomponenter/Datovelger/Datovelger';
import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useVilkårSkjema } from '../../VilkårSkjemaContext';

const hentSpørsmålForLovverkFør2025 = (periode: IIsoDatoPeriode) => {
    const fraOgMedDato = isoStringTilDateEllerUndefinedHvisUgyldigDato(periode.fom);
    const fraOgMedErFørLovendring =
        fraOgMedDato && isBefore(fraOgMedDato, datoForLovendringAugust24);
    if (fraOgMedErFørLovendring) {
        return 'Er barnet mellom 1 og 2 år eller adoptert?';
    } else {
        return 'Er barnet mellom 13 og 19 måneder eller adoptert?';
    }
};

const hentSpørsmålForLovverk = (lovverk: Lovverk | undefined, periode: IIsoDatoPeriode) => {
    if (!lovverk) {
        throw Error('Lovverk skal finnes på barnets alder');
    }
    if (lovverk === Lovverk.LOVENDRING_FEBRUAR_2025) {
        return 'Er barnet mellom 12 og 20 måneder eller adoptert?';
    } else {
        return hentSpørsmålForLovverkFør2025(periode);
    }
};

export const BarnetsAlder: React.FC<IVilkårSkjemaBaseProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    toggleForm,
    person,
    lesevisning,
}: IVilkårSkjemaBaseProps) => {
    const { toggles } = useApp();
    const { felter } = useBarnetsAlder(vilkårResultat, person, toggles[ToggleNavn.stotterAdopsjon]);
    const vilkårSkjemaContext = useVilkårSkjema(vilkårResultat, felter, person, toggleForm);

    const lovverk = utledLovverk(isoStringTilDate(person.fødselsdato), felter.adopsjonsdato.verdi);
    const spørsmål = hentSpørsmålForLovverk(
        lovverk,
        vilkårSkjemaContext.skjema.felter.periode.verdi
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
            utdypendeVilkårsvurderingChildren={
                felter.adopsjonsdato.erSynlig ? (
                    <Datovelger
                        felt={felter.adopsjonsdato}
                        label="Adopsjonsdato"
                        visFeilmeldinger={vilkårSkjemaContext.skjema.visFeilmeldinger}
                        kanKunVelgeFortid
                        readOnly={lesevisning}
                    />
                ) : null
            }
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
