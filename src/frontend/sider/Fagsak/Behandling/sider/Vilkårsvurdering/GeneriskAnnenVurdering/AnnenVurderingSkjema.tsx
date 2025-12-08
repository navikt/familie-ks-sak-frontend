import type { FocusEvent } from 'react';

import styled from 'styled-components';

import { Button, Radio, RadioGroup, Textarea } from '@navikt/ds-react';

import { useAnnenVurderingSkjema } from './AnnenVurderingSkjemaContext';
import { annenVurderingBegrunnelseFeilmeldingId } from './AnnenVurderingTabell';
import type { IGrunnlagPerson } from '../../../../../../typer/person';
import type { IAnnenVurdering, IAnnenVurderingConfig } from '../../../../../../typer/vilkår';
import { Resultat } from '../../../../../../typer/vilkår';
import { FieldsetForVilkårSkjema } from '../GeneriskVilkår/VilkårSkjema';

const Knapperad = styled.div`
    display: flex;
    justify-content: space-between;
    margin: 1rem 0;
`;

interface IProps {
    annenVurdering: IAnnenVurdering;
    erLesevisning: boolean;
    annenVurderingConfig: IAnnenVurderingConfig;
    person: IGrunnlagPerson;
    toggleForm: (visSkjema: boolean) => void;
}

export const AnnenVurderingSkjema = ({
    annenVurdering,
    erLesevisning,
    annenVurderingConfig,
    person,
    toggleForm,
}: IProps) => {
    const { skjema, lagreAnnenVurdering, lagrerAnnenVurdering, lagreAnnenVurderingFeilmelding } =
        useAnnenVurderingSkjema(annenVurdering, toggleForm);
    return (
        <FieldsetForVilkårSkjema
            error={lagreAnnenVurderingFeilmelding}
            errorPropagation={false}
            legend={''}
            $lesevisning={erLesevisning}
        >
            <RadioGroup
                readOnly={erLesevisning}
                value={skjema.felter.resultat.verdi}
                legend={
                    annenVurderingConfig.spørsmål
                        ? annenVurderingConfig.spørsmål(person.type.toLowerCase())
                        : annenVurderingConfig.beskrivelse
                }
                error={skjema.visFeilmeldinger ? skjema.felter.resultat.feilmelding : ''}
            >
                <Radio
                    name={`${annenVurdering.type}_${annenVurdering.id}`}
                    value={Resultat.OPPFYLT}
                    onChange={() => skjema.felter.resultat.validerOgSettFelt(Resultat.OPPFYLT)}
                >
                    Ja
                </Radio>
                <Radio
                    name={`${annenVurdering.type}_${annenVurdering.id}`}
                    value={Resultat.IKKE_OPPFYLT}
                    onChange={() => skjema.felter.resultat.validerOgSettFelt(Resultat.IKKE_OPPFYLT)}
                >
                    Nei
                </Radio>
            </RadioGroup>

            <Textarea
                readOnly={erLesevisning}
                defaultValue={skjema.felter.begrunnelse.verdi}
                id={annenVurderingBegrunnelseFeilmeldingId(annenVurdering)}
                label={'Begrunnelse (valgfri)'}
                placeholder={'Begrunn hvorfor det er gjort endringer på annen vurdering'}
                value={skjema.felter.begrunnelse.verdi}
                error={skjema.visFeilmeldinger ? skjema.felter.begrunnelse.feilmelding : ''}
                onChange={(event: FocusEvent<HTMLTextAreaElement>) => {
                    skjema.felter.begrunnelse.validerOgSettFelt(event.target.value);
                }}
            />

            {!erLesevisning && (
                <Knapperad>
                    <div>
                        <Button
                            onClick={lagreAnnenVurdering}
                            size="small"
                            variant="secondary"
                            loading={lagrerAnnenVurdering}
                        >
                            Ferdig
                        </Button>
                        <Button
                            style={{ marginLeft: '1rem' }}
                            onClick={() => toggleForm(false)}
                            size="small"
                            variant="tertiary"
                        >
                            Avbryt
                        </Button>
                    </div>
                </Knapperad>
            )}
        </FieldsetForVilkårSkjema>
    );
};
