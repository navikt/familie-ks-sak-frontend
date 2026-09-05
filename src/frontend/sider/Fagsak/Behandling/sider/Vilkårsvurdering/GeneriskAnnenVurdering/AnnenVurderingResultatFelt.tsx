import { useErLesevisning } from '@hooks/useErLesevisning';
import type { IGrunnlagPerson } from '@typer/person';
import { type IAnnenVurderingConfig, Resultat } from '@typer/vilkår';
import { useController, useFormContext } from 'react-hook-form';

import { Radio, RadioGroup } from '@navikt/ds-react';

import { AnnenVurderingFelt, type AnnenVurderingFormValues } from './useAnnenVurderingSkjema';
import { validerResultat } from '../validering';

interface Props {
    person: IGrunnlagPerson;
    annenVurderingConfig: IAnnenVurderingConfig;
}

export function AnnenVurderingResultatFelt({ person, annenVurderingConfig }: Props) {
    const erLesevisning = useErLesevisning();

    const { control } = useFormContext<AnnenVurderingFormValues>();

    const {
        field: { value, onChange, onBlur, ref },
        fieldState: { error },
        formState: { isSubmitting },
    } = useController({
        name: AnnenVurderingFelt.RESULTAT,
        control,
        rules: {
            validate: resultat => validerResultat(resultat),
        },
    });

    return (
        <RadioGroup
            ref={ref}
            onBlur={onBlur}
            readOnly={erLesevisning || isSubmitting}
            value={value}
            legend={
                annenVurderingConfig.spørsmål
                    ? annenVurderingConfig.spørsmål(person.type.toLowerCase())
                    : annenVurderingConfig.beskrivelse
            }
            error={error?.message}
            onChange={onChange}
        >
            <Radio value={Resultat.OPPFYLT}>Ja</Radio>
            <Radio value={Resultat.IKKE_OPPFYLT}>Nei</Radio>
        </RadioGroup>
    );
}
