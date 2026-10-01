import { useBehandling } from '@hooks/useBehandling';
import { Select } from '@navikt/ds-react';
import { lagPersonLabel } from '@utils/formatter';
import { useController, useFormContext } from 'react-hook-form';

import {
    EndretUtbetalingAndelFeltnavn,
    type EndretUtbetalingAndelFormValues,
    type StandardFeltProps,
} from '../endretUtbetalingAndelSkjemaTyper';

export function Personvelger({ erLesevisning }: StandardFeltProps) {
    const behandling = useBehandling();
    const { control } = useFormContext<EndretUtbetalingAndelFormValues>();

    const {
        field: { value, onChange, onBlur, ref },
        fieldState: { error },
    } = useController({
        name: EndretUtbetalingAndelFeltnavn.PERSON,
        control,
        rules: { required: 'Du må velge en person' },
    });

    const identerMedAndeler = behandling.personerMedAndelerTilkjentYtelse.map(person => person.personIdent);
    const personerMedAndeler = behandling.personer.filter(person => identerMedAndeler.includes(person.personIdent));

    return (
        <Select
            label={'Velg hvem det gjelder'}
            value={value}
            onChange={event => onChange(event.target.value)}
            onBlur={onBlur}
            ref={ref}
            error={error?.message}
            readOnly={erLesevisning}
            style={{ maxWidth: '20rem' }}
        >
            <option value={''}>Velg person</option>
            {personerMedAndeler.map(person => (
                <option value={person.personIdent} key={person.personIdent}>
                    {lagPersonLabel(person.personIdent, behandling.personer)}
                </option>
            ))}
        </Select>
    );
}
