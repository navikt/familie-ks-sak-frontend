import type { ChangeEvent } from 'react';

import type { IGrunnlagPerson } from '@typer/person';
import { PersonType } from '@typer/person';
import { lagPersonLabel } from '@utils/formatter';
import { useController, useFormContext } from 'react-hook-form';

import { Select } from '@navikt/ds-react';

import { type BrevModulFormValues, BrevmodulFeltnavn } from './useBrevModul';
import { useSkjemaErLåst } from './useSkjemaErLåst';

interface Props {
    personer: IGrunnlagPerson[];
}

export function MottakerSelect({ personer }: Props) {
    const { control } = useFormContext<BrevModulFormValues>();
    const skjemaErLåst = useSkjemaErLåst();

    const {
        field,
        fieldState: { error },
    } = useController({
        name: BrevmodulFeltnavn.MOTTAKER_IDENT,
        control,
        rules: { validate: verdi => (verdi.length >= 1 ? true : 'Du må velge en mottaker') },
    });

    return (
        <Select
            label={'Velg mottaker'}
            value={field.value}
            error={error?.message}
            readOnly={skjemaErLåst}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => field.onChange(event.target.value)}
            onBlur={field.onBlur}
        >
            <option value={''}>Velg</option>
            {personer
                .filter((person: IGrunnlagPerson) => person.type !== PersonType.BARN)
                .map((person, index) => (
                    <option key={`${index}_${person.fødselsdato}`} value={person.personIdent}>
                        {lagPersonLabel(person.personIdent, personer)}
                    </option>
                ))}
        </Select>
    );
}
