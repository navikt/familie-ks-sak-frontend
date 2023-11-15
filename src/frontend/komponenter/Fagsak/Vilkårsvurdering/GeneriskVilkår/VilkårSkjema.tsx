import type { ReactNode } from 'react';
import React from 'react';

import styled from 'styled-components';

import { Radio, SkjemaGruppe } from 'nav-frontend-skjema';

import { Delete } from '@navikt/ds-icons';
import { Button, Label } from '@navikt/ds-react';
import { ABorderDefault, ABorderWarning, ASurfaceAction } from '@navikt/ds-tokens/dist/tokens';
import {
    FamilieKnapp,
    FamilieRadioGruppe,
    FamilieSelect,
    FamilieTextarea,
} from '@navikt/familie-form-elements';
import { RessursStatus } from '@navikt/familie-typer';

import AvslagSkjema from './AvslagSkjema';
import { UtdypendeVilkårsvurderingMultiselect } from './UtdypendeVilkårsvurderingMultiselect';
import VelgPeriode from './VelgPeriode';
import type { IVilkårSkjemaContext, VilkårSkjemaContextValue } from './VilkårSkjemaContext';
import { vilkårBegrunnelseFeilmeldingId, vilkårFeilmeldingId } from './VilkårTabell';
import { useBehandling } from '../../../../context/behandlingContext/BehandlingContext';
import { BehandlingÅrsak } from '../../../../typer/behandling';
import type { IGrunnlagPerson } from '../../../../typer/person';
import { PersonType } from '../../../../typer/person';
import type {
    IVilkårConfig,
    IVilkårResultat,
    UtdypendeVilkårsvurdering,
} from '../../../../typer/vilkår';
import { Regelverk, Resultat, resultater, VilkårType } from '../../../../typer/vilkår';
import { alleRegelverk } from '../../../../utils/vilkår';

const Container = styled.div`
    max-width: 30rem;
    border-left: 0.125rem solid
        ${(props: { lesevisning: boolean; vilkårResultat: Resultat | undefined }) => {
            if (props.lesevisning) {
                return ABorderDefault;
            }
            if (props.vilkårResultat === Resultat.IKKE_VURDERT) {
                return ABorderWarning;
            }
            return ASurfaceAction;
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

const StyledFamilieRadioGruppe = styled(FamilieRadioGruppe)`
    && {
        margin: 1rem 0;
        legend {
            margin-bottom: 0rem;
        }
    }
`;

export interface IVilkårSkjemaBaseProps {
    lesevisning: boolean;
    vilkårResultat: IVilkårResultat;
    vilkårFraConfig: IVilkårConfig;
    person: IGrunnlagPerson;
    toggleForm: (visSkjema: boolean) => void;
}

export interface IVilkårSkjema<T extends IVilkårSkjemaContext> extends IVilkårSkjemaBaseProps {
    vilkårSkjemaContext: VilkårSkjemaContextValue<T>;
    visVurderesEtter?: boolean;
    visSpørsmål?: boolean;
    muligeUtdypendeVilkårsvurderinger?: UtdypendeVilkårsvurdering[];
    periodeChildren?: ReactNode;
    children?: ReactNode;
    vurderesEtterEndringer?: (vurderesEtter: Regelverk) => void;
}

export const VilkårSkjema = <T extends IVilkårSkjemaContext>({
    vilkårSkjemaContext,
    visVurderesEtter,
    visSpørsmål,
    muligeUtdypendeVilkårsvurderinger,
    lesevisning,
    vilkårResultat,
    vilkårFraConfig,
    person,
    toggleForm,
    children,
    periodeChildren,
    vurderesEtterEndringer,
}: IVilkårSkjema<T>) => {
    const { åpenBehandling } = useBehandling();
    const årsakErSøknad =
        åpenBehandling.status !== RessursStatus.SUKSESS ||
        åpenBehandling.data.årsak === BehandlingÅrsak.SØKNAD;
    const { skjema, lagreVilkår, lagrerVilkår, slettVilkår, sletterVilkår, feilmelding } =
        vilkårSkjemaContext;

    return (
        <SkjemaGruppe feil={feilmelding} utenFeilPropagering={true}>
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
                        onChange={event => {
                            skjema.felter.vurderesEtter.validerOgSettFelt(
                                event.target.value as Regelverk
                            );
                            if (vurderesEtterEndringer) {
                                vurderesEtterEndringer(event.target.value as Regelverk);
                            }

                            if (
                                (event.target.value as Regelverk) === Regelverk.NASJONALE_REGLER &&
                                VilkårType.MEDLEMSKAP === vilkårResultat.vilkårType
                            ) {
                                skjema.felter.resultat.validerOgSettFelt(Resultat.IKKE_VURDERT);
                            }
                        }}
                    >
                        {Object.entries(alleRegelverk).map(
                            ([regelverk, { tekst }]: [
                                string,
                                { tekst: string; symbol: ReactNode },
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
                {visSpørsmål && (
                    <StyledFamilieRadioGruppe
                        erLesevisning={lesevisning}
                        value={resultater[skjema.felter.resultat.verdi]}
                        legend={
                            <Label>
                                {vilkårFraConfig.spørsmål
                                    ? vilkårFraConfig.spørsmål(person.type.toLowerCase())
                                    : ''}
                            </Label>
                        }
                        error={skjema.visFeilmeldinger ? skjema.felter.resultat.feilmelding : ''}
                    >
                        <Radio
                            label={'Ja'}
                            name={`${vilkårResultat.vilkårType}_${vilkårResultat.id}`}
                            checked={skjema.felter.resultat.verdi === Resultat.OPPFYLT}
                            onChange={() => {
                                skjema.felter.resultat.validerOgSettFelt(Resultat.OPPFYLT);
                                vilkårSkjemaContext.skjema.felter.erEksplisittAvslagPåSøknad.validerOgSettFelt(
                                    false
                                );
                                vilkårSkjemaContext.skjema.felter.avslagBegrunnelser.validerOgSettFelt(
                                    []
                                );
                            }}
                        />
                        <Radio
                            label={'Nei'}
                            name={`${vilkårResultat.vilkårType}_${vilkårResultat.id}`}
                            checked={skjema.felter.resultat.verdi === Resultat.IKKE_OPPFYLT}
                            onChange={() =>
                                skjema.felter.resultat.validerOgSettFelt(Resultat.IKKE_OPPFYLT)
                            }
                        />
                    </StyledFamilieRadioGruppe>
                )}
                {children}
                <UtdypendeVilkårsvurderingMultiselect
                    utdypendeVilkårsvurderinger={skjema.felter.utdypendeVilkårsvurdering}
                    muligeUtdypendeVilkårsvurderinger={muligeUtdypendeVilkårsvurderinger}
                    erLesevisning={lesevisning}
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
                    children={periodeChildren}
                />
                <FamilieTextarea
                    erLesevisning={lesevisning}
                    id={vilkårBegrunnelseFeilmeldingId(vilkårResultat)}
                    label={`Begrunnelse ${
                        erBegrunnelsePåkrevd(
                            skjema.felter.vurderesEtter.verdi,
                            skjema.felter.utdypendeVilkårsvurdering.verdi,
                            person.type,
                            vilkårResultat.vilkårType
                        )
                            ? ''
                            : '(valgfri)'
                    }`}
                    className={'begrunnelse-textarea'}
                    placeholder={'Begrunn hvorfor det er gjort endringer på vilkåret.'}
                    value={skjema.felter.begrunnelse.verdi}
                    error={skjema.visFeilmeldinger ? skjema.felter.begrunnelse.feilmelding : ''}
                    onChange={(event: React.FocusEvent<HTMLTextAreaElement>) => {
                        skjema.felter.begrunnelse.validerOgSettFelt(event.target.value);
                    }}
                />
                <Knapperad>
                    <div>
                        <FamilieKnapp
                            erLesevisning={lesevisning}
                            onClick={lagreVilkår}
                            size="medium"
                            variant="secondary"
                            loading={lagrerVilkår}
                            disabled={lagrerVilkår}
                        >
                            Ferdig
                        </FamilieKnapp>
                        <FamilieKnapp
                            style={{ marginLeft: '1rem' }}
                            erLesevisning={lesevisning}
                            onClick={() => toggleForm(false)}
                            size="medium"
                            variant="tertiary"
                        >
                            Avbryt
                        </FamilieKnapp>
                    </div>

                    {!lesevisning && (
                        <Button
                            onClick={() => slettVilkår(person.personIdent, vilkårResultat.id)}
                            id={vilkårFeilmeldingId(vilkårResultat)}
                            loading={sletterVilkår}
                            disabled={sletterVilkår}
                            size={'medium'}
                            variant={'tertiary'}
                            icon={<Delete />}
                        >
                            {'Fjern'}
                        </Button>
                    )}
                </Knapperad>
            </Container>
        </SkjemaGruppe>
    );
};

export const erBegrunnelsePåkrevd = (
    vurderesEtter: Regelverk | undefined,
    utdypendeVilkårsvurderinger: UtdypendeVilkårsvurdering[],
    personType: PersonType,
    vilkårType: VilkårType
): boolean => {
    return (
        utdypendeVilkårsvurderinger.length > 0 ||
        (vurderesEtter === Regelverk.EØS_FORORDNINGEN &&
            personType === PersonType.SØKER &&
            vilkårType === VilkårType.BOSATT_I_RIKET)
    );
};
