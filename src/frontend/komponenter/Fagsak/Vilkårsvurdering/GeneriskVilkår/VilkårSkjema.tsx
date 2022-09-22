import type { ReactNode } from 'react';
import React from 'react';

import styled from 'styled-components';

import { Radio, SkjemaGruppe } from 'nav-frontend-skjema';

import { Delete } from '@navikt/ds-icons';
import {
    NavdsSemanticColorBorderMuted,
    NavdsSemanticColorFeedbackWarningBorder,
    NavdsSemanticColorInteractionPrimary,
} from '@navikt/ds-tokens/dist/tokens';
import {
    FamilieKnapp,
    FamilieRadioGruppe,
    FamilieSelect,
    FamilieTextareaControlled,
} from '@navikt/familie-form-elements';
import type { FieldDictionary } from '@navikt/familie-skjema';
import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../../context/behandlingContext/BehandlingContext';
import { BehandlingÅrsak } from '../../../../typer/behandling';
import type { IGrunnlagPerson } from '../../../../typer/person';
import type { IVilkårConfig, IVilkårResultat, Regelverk } from '../../../../typer/vilkår';
import { Resultat, resultater } from '../../../../typer/vilkår';
import { alleRegelverk } from '../../../../utils/vilkår';
import IkonKnapp, { IkonPosisjon } from '../../../Felleskomponenter/IkonKnapp/IkonKnapp';
import AvslagSkjema from './AvslagSkjema';
import { UtdypendeVilkårsvurderingMultiselect } from './UtdypendeVilkårsvurderingMultiselect';
import VelgPeriode from './VelgPeriode';
import type { IVilkårSkjemaContext } from './VilkårSkjemaContext';
import { useVilkårSkjema } from './VilkårSkjemaContext';
import { vilkårBegrunnelseFeilmeldingId, vilkårFeilmeldingId } from './VilkårTabell';

const Container = styled.div`
    max-width: 30rem;
    border-left: 0.125rem solid
        ${(props: { lesevisning: boolean; vilkårResultat: Resultat | undefined }) => {
            if (props.lesevisning) {
                return NavdsSemanticColorBorderMuted;
            }
            if (props.vilkårResultat === Resultat.IKKE_VURDERT) {
                return NavdsSemanticColorFeedbackWarningBorder;
            }
            return NavdsSemanticColorInteractionPrimary;
        }};
    padding-left: 2rem;
    margin-left: -3rem;

    .skjemagruppe.radiogruppe {
        margin-bottom: 0 !important;
    }
    .begrunnelse-textarea {
        min-height: 8rem !important;
    }
`;

const Knapperad = styled.div`
    display: flex;
    justify-content: space-between;
    margin: 1rem 0;
`;

export interface IVilkårSkjemaBaseProps {
    lesevisning: boolean;
    vilkårResultat: IVilkårResultat;
    vilkårFraConfig: IVilkårConfig;
    person: IGrunnlagPerson;
    toggleForm: (visSkjema: boolean) => void;
    onResultatJa?: () => Resultat;
    resultatJaChecked?: (resultat: Resultat) => boolean;
    onResultatNei?: () => Resultat;
    resultatNeiChecked?: (resultat: Resultat) => boolean;
}

export interface IVilkårSkjema<T extends IVilkårSkjemaContext> extends IVilkårSkjemaBaseProps {
    visVurderesEtter: boolean;
    felter: FieldDictionary<T>;
    children?: ReactNode;
}

export const VilkårSkjema = <T extends IVilkårSkjemaContext>({
    visVurderesEtter,
    lesevisning,
    vilkårResultat,
    vilkårFraConfig,
    person,
    toggleForm,
    onResultatJa,
    resultatJaChecked,
    onResultatNei,
    resultatNeiChecked,
    felter,
    children,
}: IVilkårSkjema<T>) => {
    const { skjema, lagreVilkår, lagrerVilkår, slettVilkår, sletterVilkår, feilmelding } =
        useVilkårSkjema(vilkårResultat, felter, person, toggleForm);

    const { åpenBehandling } = useBehandling();
    const årsakErSøknad =
        åpenBehandling.status !== RessursStatus.SUKSESS ||
        åpenBehandling.data.årsak === BehandlingÅrsak.SØKNAD;

    return (
        <SkjemaGruppe feil={feilmelding}>
            <Container lesevisning={false} vilkårResultat={undefined}>
                {visVurderesEtter && (
                    <FamilieSelect
                        erLesevisning={lesevisning}
                        lesevisningVerdi={
                            skjema.felter.vurderesEtter.verdi
                                ? alleRegelverk[skjema.felter.vurderesEtter.verdi as Regelverk]
                                      .tekst
                                : 'Generell vurdering'
                        }
                        value={skjema.felter.vurderesEtter.verdi}
                        label={'Vurderes etter'}
                        onChange={event =>
                            skjema.felter.vurderesEtter.validerOgSettFelt(
                                event.target.value as Regelverk
                            )
                        }
                    >
                        {Object.entries(alleRegelverk).map(
                            ([regelverk, { tekst }]: [
                                string,
                                { tekst: string; symbol: ReactNode }
                            ]) => {
                                return (
                                    <option
                                        key={regelverk}
                                        aria-selected={
                                            skjema.felter.vurderesEtter.verdi === regelverk
                                        }
                                        value={regelverk}
                                    >
                                        {tekst}
                                    </option>
                                );
                            }
                        )}
                    </FamilieSelect>
                )}
                <FamilieRadioGruppe
                    erLesevisning={lesevisning}
                    verdi={resultater[skjema.felter.resultat.verdi]}
                    legend={
                        vilkårFraConfig.spørsmål
                            ? vilkårFraConfig.spørsmål(person.type.toLowerCase())
                            : ''
                    }
                    feil={skjema.visFeilmeldinger ? skjema.felter.resultat.feilmelding : ''}
                >
                    <Radio
                        label={'Ja'}
                        name={`${vilkårResultat.vilkårType}_${vilkårResultat.id}`}
                        checked={
                            resultatJaChecked
                                ? resultatJaChecked(skjema.felter.resultat.verdi)
                                : skjema.felter.resultat.verdi === Resultat.OPPFYLT
                        }
                        onChange={() =>
                            skjema.felter.resultat.validerOgSettFelt(
                                onResultatJa ? onResultatJa() : Resultat.OPPFYLT
                            )
                        }
                    />
                    <Radio
                        label={'Nei'}
                        name={`${vilkårResultat.vilkårType}_${vilkårResultat.id}`}
                        checked={
                            resultatNeiChecked
                                ? resultatNeiChecked(skjema.felter.resultat.verdi)
                                : skjema.felter.resultat.verdi === Resultat.IKKE_OPPFYLT
                        }
                        onChange={() =>
                            skjema.felter.resultat.validerOgSettFelt(
                                onResultatNei ? onResultatNei() : Resultat.IKKE_OPPFYLT
                            )
                        }
                    />
                </FamilieRadioGruppe>
                {children}
                <UtdypendeVilkårsvurderingMultiselect
                    vilkårResultat={vilkårResultat}
                    utdypendeVilkårsvurderinger={skjema.felter.utdypendeVilkårsvurdering}
                    resultat={skjema.felter.resultat}
                    vurderesEtter={skjema.felter.vurderesEtter}
                    erLesevisning={lesevisning}
                    personType={person.type}
                    feilhåndtering={
                        skjema.visFeilmeldinger
                            ? skjema.felter.utdypendeVilkårsvurdering.feilmelding
                            : ''
                    }
                />
                {skjema.felter.resultat.verdi === Resultat.IKKE_OPPFYLT && årsakErSøknad && (
                    <AvslagSkjema
                        vilkår={vilkårResultat}
                        erEksplisittAvslagPåSøknad={skjema.felter.erEksplisittAvslagPåSøknad}
                        avslagBegrunnelser={skjema.felter.avslagBegrunnelser}
                        visFeilmeldinger={skjema.visFeilmeldinger}
                    />
                )}
                <VelgPeriode
                    vilkår={vilkårResultat}
                    periode={skjema.felter.periode}
                    erEksplisittAvslagPåSøknad={skjema.felter.erEksplisittAvslagPåSøknad}
                    resultat={skjema.felter.resultat}
                    visFeilmeldinger={skjema.visFeilmeldinger}
                />
                <FamilieTextareaControlled
                    tekstLesevisning={''}
                    erLesevisning={lesevisning}
                    defaultValue={skjema.felter.begrunnelse.verdi}
                    id={vilkårBegrunnelseFeilmeldingId(vilkårResultat)}
                    label={`Begrunnelse (valgfri)`}
                    textareaClass={'begrunnelse-textarea'}
                    placeholder={'Begrunn hvorfor det er gjort endringer på vilkåret.'}
                    value={skjema.felter.begrunnelse.verdi}
                    feil={skjema.visFeilmeldinger ? skjema.felter.begrunnelse.feilmelding : ''}
                    onBlur={(event: React.FocusEvent<HTMLTextAreaElement>) => {
                        skjema.felter.begrunnelse.validerOgSettFelt(event.target.value);
                    }}
                />
                <Knapperad>
                    <div>
                        <FamilieKnapp
                            erLesevisning={lesevisning}
                            onClick={lagreVilkår}
                            mini={true}
                            type={'standard'}
                            spinner={lagrerVilkår}
                            disabled={lagrerVilkår}
                        >
                            Ferdig
                        </FamilieKnapp>
                        <FamilieKnapp
                            style={{ marginLeft: '1rem' }}
                            erLesevisning={lesevisning}
                            onClick={() => toggleForm(false)}
                            mini={true}
                            type={'flat'}
                        >
                            Avbryt
                        </FamilieKnapp>
                    </div>

                    <IkonKnapp
                        erLesevisning={lesevisning}
                        onClick={() => slettVilkår(person.personIdent, vilkårResultat.id)}
                        id={vilkårFeilmeldingId(vilkårResultat)}
                        spinner={sletterVilkår}
                        disabled={sletterVilkår}
                        mini={true}
                        label={'Fjern'}
                        ikonPosisjon={IkonPosisjon.VENSTRE}
                        ikon={<Delete />}
                    />
                </Knapperad>
            </Container>
        </SkjemaGruppe>
    );
};
