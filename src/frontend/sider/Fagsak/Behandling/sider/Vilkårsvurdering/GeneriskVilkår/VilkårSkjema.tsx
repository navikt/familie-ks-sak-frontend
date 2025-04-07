import type { ReactNode } from 'react';
import React from 'react';

import styled from 'styled-components';

import { TrashIcon } from '@navikt/aksel-icons';
import { Button, Fieldset, Label, Radio, RadioGroup, Select, Textarea } from '@navikt/ds-react';
import { ABorderDefault, ABorderWarning, ASurfaceAction } from '@navikt/ds-tokens/dist/tokens';
import { RessursStatus } from '@navikt/familie-typer';

import AvslagSkjema from './AvslagSkjema';
import { UtdypendeVilkårsvurderingMultiselect } from './UtdypendeVilkårsvurderingMultiselect';
import VelgPeriode from './VelgPeriode';
import type { IVilkårSkjemaContext, VilkårSkjemaContextValue } from './VilkårSkjemaContext';
import { vilkårBegrunnelseFeilmeldingId, vilkårFeilmeldingId } from './VilkårTabell';
import { useBehandling } from '../../../../../../context/behandlingContext/BehandlingContext';
import { BehandlingÅrsak } from '../../../../../../typer/behandling';
import type { IGrunnlagPerson } from '../../../../../../typer/person';
import { PersonType } from '../../../../../../typer/person';
import type {
    IVilkårConfig,
    IVilkårResultat,
    UtdypendeVilkårsvurdering,
} from '../../../../../../typer/vilkår';
import { Regelverk, Resultat, VilkårType } from '../../../../../../typer/vilkår';
import { alleRegelverk } from '../../../../../../utils/vilkår';

export const FieldsetForVilkårSkjema = styled(Fieldset)<{
    $lesevisning: boolean;
    $vilkårResultat: Resultat | undefined;
}>`
    max-width: 30rem;
    border-left: 0.125rem solid
        ${props => {
            if (props.$lesevisning) {
                return ABorderDefault;
            }
            if (props.$vilkårResultat === Resultat.IKKE_VURDERT) {
                return ABorderWarning;
            }
            return ASurfaceAction;
        }};
    padding-left: 2rem;
`;

const Knapperad = styled.div`
    display: flex;
    justify-content: space-between;
    margin: 1rem 0;
`;

export interface IVilkårSkjemaBaseProps {
    lagretVilkårResultat: IVilkårResultat;
    vilkårFraConfig: IVilkårConfig;
    person: IGrunnlagPerson;
    settFokusPåLeggTilPeriodeKnapp: () => void;
}

interface IVilkårSkjema<T extends IVilkårSkjemaContext> extends IVilkårSkjemaBaseProps {
    vilkårSkjemaContext: VilkårSkjemaContextValue<T>;
    visVurderesEtter?: boolean;
    visSpørsmål?: boolean;
    muligeUtdypendeVilkårsvurderinger?: UtdypendeVilkårsvurdering[];
    utdypendeVilkårsvurderingChildren?: ReactNode;
    periodeChildren?: ReactNode;
    children?: ReactNode;
    oppdaterMuligeUtdypendeVilkårsvurderinger?: (vurderesEtter: Regelverk) => void;
    toggleForm: (visSkjema: boolean) => void;
    lesevisning: boolean;
}

export const VilkårSkjema = <T extends IVilkårSkjemaContext>({
    vilkårSkjemaContext,
    visVurderesEtter,
    visSpørsmål,
    muligeUtdypendeVilkårsvurderinger,
    lesevisning,
    lagretVilkårResultat,
    vilkårFraConfig,
    person,
    toggleForm,
    children,
    periodeChildren,
    utdypendeVilkårsvurderingChildren,
    oppdaterMuligeUtdypendeVilkårsvurderinger,
    settFokusPåLeggTilPeriodeKnapp,
}: IVilkårSkjema<T>) => {
    const { åpenBehandling } = useBehandling();
    const årsakErSøknad =
        åpenBehandling.status !== RessursStatus.SUKSESS ||
        åpenBehandling.data.årsak === BehandlingÅrsak.SØKNAD;
    const {
        skjema,
        lagreVilkår,
        lagrerVilkår,
        slettVilkår,
        sletterVilkår,
        feilmelding,
        nullstillSkjema,
    } = vilkårSkjemaContext;

    return (
        <FieldsetForVilkårSkjema
            error={feilmelding}
            errorPropagation={false}
            legend={'Endre vilkår'}
            hideLegend
            $lesevisning={false}
            $vilkårResultat={undefined}
        >
            {visVurderesEtter && (
                <Select
                    readOnly={lesevisning}
                    value={skjema.felter.vurderesEtter.verdi}
                    label={'Vurderes etter'}
                    onChange={event => {
                        skjema.felter.vurderesEtter.validerOgSettFelt(
                            event.target.value as Regelverk
                        );
                        if (oppdaterMuligeUtdypendeVilkårsvurderinger) {
                            oppdaterMuligeUtdypendeVilkårsvurderinger(
                                event.target.value as Regelverk
                            );
                        }

                        if (
                            (event.target.value as Regelverk) === Regelverk.NASJONALE_REGLER &&
                            VilkårType.MEDLEMSKAP === lagretVilkårResultat.vilkårType
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
                                    aria-selected={skjema.felter.vurderesEtter.verdi === regelverk}
                                    value={regelverk}
                                >
                                    {tekst}
                                </option>
                            );
                        }
                    )}
                </Select>
            )}
            {visSpørsmål && (
                <RadioGroup
                    readOnly={lesevisning}
                    value={skjema.felter.resultat.verdi}
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
                        name={`${lagretVilkårResultat.vilkårType}_${lagretVilkårResultat.id}`}
                        value={Resultat.OPPFYLT}
                        onChange={() => {
                            skjema.felter.resultat.validerOgSettFelt(Resultat.OPPFYLT);
                            vilkårSkjemaContext.skjema.felter.erEksplisittAvslagPåSøknad.validerOgSettFelt(
                                false
                            );
                            vilkårSkjemaContext.skjema.felter.avslagBegrunnelser.validerOgSettFelt(
                                []
                            );
                        }}
                    >
                        Ja
                    </Radio>
                    <Radio
                        name={`${lagretVilkårResultat.vilkårType}_${lagretVilkårResultat.id}`}
                        value={Resultat.IKKE_OPPFYLT}
                        onChange={() =>
                            skjema.felter.resultat.validerOgSettFelt(Resultat.IKKE_OPPFYLT)
                        }
                    >
                        Nei
                    </Radio>
                </RadioGroup>
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
                children={utdypendeVilkårsvurderingChildren}
            />
            {skjema.felter.resultat.verdi === Resultat.IKKE_OPPFYLT && årsakErSøknad && (
                <AvslagSkjema
                    lagretVilkår={lagretVilkårResultat}
                    erEksplisittAvslagPåSøknad={skjema.felter.erEksplisittAvslagPåSøknad}
                    avslagBegrunnelser={skjema.felter.avslagBegrunnelser}
                    visFeilmeldinger={skjema.visFeilmeldinger}
                />
            )}
            <VelgPeriode
                periode={skjema.felter.periode}
                erEksplisittAvslagPåSøknad={skjema.felter.erEksplisittAvslagPåSøknad}
                resultat={skjema.felter.resultat}
                visFeilmeldinger={skjema.visFeilmeldinger}
                children={periodeChildren}
                tomErPåkrevd={lagretVilkårResultat.vilkårType === VilkårType.BARNETS_ALDER}
            />
            <Textarea
                readOnly={lesevisning}
                id={vilkårBegrunnelseFeilmeldingId(lagretVilkårResultat)}
                label={`Begrunnelse ${
                    erBegrunnelsePåkrevd(
                        skjema.felter.vurderesEtter.verdi,
                        skjema.felter.utdypendeVilkårsvurdering.verdi,
                        person.type,
                        lagretVilkårResultat.vilkårType,
                        skjema.felter.søkerHarMeldtFraOmBarnehageplass?.verdi
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
            {!lesevisning && (
                <Knapperad>
                    <div>
                        <Button
                            onClick={() => {
                                lagreVilkår(() => {
                                    toggleForm(false);
                                    nullstillSkjema();
                                    settFokusPåLeggTilPeriodeKnapp();
                                });
                            }}
                            size="medium"
                            variant="secondary"
                            loading={lagrerVilkår}
                            disabled={lagrerVilkår}
                        >
                            Ferdig
                        </Button>
                        <Button
                            style={{ marginLeft: '1rem' }}
                            onClick={() => {
                                toggleForm(false);
                                nullstillSkjema();
                            }}
                            size="medium"
                            variant="tertiary"
                        >
                            Avbryt
                        </Button>
                    </div>

                    <Button
                        onClick={() =>
                            slettVilkår(person.personIdent, lagretVilkårResultat.id, () => {
                                toggleForm(false);
                                nullstillSkjema();
                            })
                        }
                        id={vilkårFeilmeldingId(lagretVilkårResultat)}
                        loading={sletterVilkår}
                        disabled={sletterVilkår}
                        size={'medium'}
                        variant={'tertiary'}
                        icon={<TrashIcon />}
                    >
                        {'Fjern'}
                    </Button>
                </Knapperad>
            )}
        </FieldsetForVilkårSkjema>
    );
};

export const erBegrunnelsePåkrevd = (
    vurderesEtter: Regelverk | undefined,
    utdypendeVilkårsvurderinger: UtdypendeVilkårsvurdering[],
    personType: PersonType,
    vilkårType: VilkårType,
    søkerHarMeldtFraOmBarnehageplass?: boolean
): boolean => {
    return (
        (vilkårType == VilkårType.BARNEHAGEPLASS && søkerHarMeldtFraOmBarnehageplass) ||
        (vurderesEtter === Regelverk.NASJONALE_REGLER && utdypendeVilkårsvurderinger.length > 0) ||
        (vurderesEtter === Regelverk.EØS_FORORDNINGEN &&
            personType === PersonType.SØKER &&
            vilkårType === VilkårType.BOSATT_I_RIKET)
    );
};
