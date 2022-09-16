import React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Radio, SkjemaGruppe } from 'nav-frontend-skjema';

import {
    FamilieKnapp,
    FamilieRadioGruppe,
    FamilieTextareaControlled,
} from '@navikt/familie-form-elements';

import type { IGrunnlagPerson } from '../../../../typer/person';
import type { IAnnenVurdering, IAnnenVurderingConfig } from '../../../../typer/vilkår';
import { Resultat, resultater } from '../../../../typer/vilkår';
import { useAnnenVurderingSkjema } from './AnnenVurderingSkjemaContext';
import { annenVurderingBegrunnelseFeilmeldingId } from './AnnenVurderingTabell';

const Container = styled.div`
    max-width: 30rem;
    border-left: 1px solid ${navFarger.navBlaLighten20};
    padding-left: 2rem;
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

interface IProps {
    annenVurdering: IAnnenVurdering;
    lesevinsing: boolean;
    annenVurderingConfig: IAnnenVurderingConfig;
    person: IGrunnlagPerson;
    toggleForm: (visSkjema: boolean) => void;
}

export const AnnenVurderingSkjema: React.FC<IProps> = ({
    annenVurdering,
    lesevinsing,
    annenVurderingConfig,
    person,
    toggleForm,
}: IProps) => {
    const { skjema, lagreAnnenVurdering, lagrerAnnenVurdering, lagrerAnnenVurderingFeilmelding } =
        useAnnenVurderingSkjema(annenVurdering, toggleForm);
    return (
        <SkjemaGruppe feil={lagrerAnnenVurderingFeilmelding} utenFeilPropagering={true}>
            <Container>
                <FamilieRadioGruppe
                    erLesevisning={lesevinsing}
                    verdi={resultater[skjema.felter.resultat.verdi]}
                    legend={
                        annenVurderingConfig.spørsmål
                            ? annenVurderingConfig.spørsmål(person.type.toLowerCase())
                            : annenVurderingConfig.beskrivelse
                    }
                    feil={skjema.visFeilmeldinger ? skjema.felter.resultat.feilmelding : ''}
                >
                    <Radio
                        label={'Ja'}
                        name={`${annenVurdering.type}_${annenVurdering.id}`}
                        checked={skjema.felter.resultat.verdi === Resultat.OPPFYLT}
                        onChange={() => skjema.felter.resultat.validerOgSettFelt(Resultat.OPPFYLT)}
                    />
                    <Radio
                        label={'Nei'}
                        name={`${annenVurdering.type}_${annenVurdering.id}`}
                        checked={skjema.felter.resultat.verdi === Resultat.IKKE_OPPFYLT}
                        onChange={() =>
                            skjema.felter.resultat.validerOgSettFelt(Resultat.IKKE_OPPFYLT)
                        }
                    />
                </FamilieRadioGruppe>

                <FamilieTextareaControlled
                    tekstLesevisning={''}
                    erLesevisning={lesevinsing}
                    defaultValue={skjema.felter.begrunnelse.verdi}
                    id={annenVurderingBegrunnelseFeilmeldingId(annenVurdering)}
                    label={'Begrunnelse (valgfri)'}
                    textareaClass={'begrunnelse-textarea'}
                    placeholder={'Begrunn hvorfor det er gjort endringer på annen vurdering'}
                    value={skjema.felter.begrunnelse.verdi}
                    feil={skjema.visFeilmeldinger ? skjema.felter.begrunnelse.feilmelding : ''}
                    onBlur={(event: React.FocusEvent<HTMLTextAreaElement>) => {
                        skjema.felter.begrunnelse.validerOgSettFelt(event.target.value);
                    }}
                />

                <Knapperad>
                    <div>
                        <FamilieKnapp
                            erLesevisning={lesevinsing}
                            onClick={lagreAnnenVurdering}
                            mini={true}
                            type={'standard'}
                            spinner={lagrerAnnenVurdering}
                            disabled={lagrerAnnenVurdering}
                        >
                            Ferdig
                        </FamilieKnapp>
                        <FamilieKnapp
                            style={{ marginLeft: '1rem' }}
                            erLesevisning={lesevinsing}
                            onClick={() => toggleForm(false)}
                            mini={true}
                            type={'flat'}
                        >
                            Avbryt
                        </FamilieKnapp>
                    </div>
                </Knapperad>
            </Container>
        </SkjemaGruppe>
    );
};
