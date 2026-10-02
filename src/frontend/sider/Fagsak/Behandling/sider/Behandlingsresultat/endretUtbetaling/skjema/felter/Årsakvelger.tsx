import { Select } from '@navikt/ds-react';
import { IEndretUtbetalingAndelÅrsak, årsaker, årsakTekst } from '@typer/utbetalingAndel';
import { useController, useFormContext } from 'react-hook-form';

import {
    EndretUtbetalingAndelFeltnavn,
    type EndretUtbetalingAndelFormValues,
    type StandardFeltProps,
} from '../endretUtbetalingAndelSkjemaTyper';

export function Årsakvelger({ erLesevisning }: StandardFeltProps) {
    const { control, setValue } = useFormContext<EndretUtbetalingAndelFormValues>();

    const {
        field: { value, onChange, onBlur, ref },
        fieldState: { error },
    } = useController({
        name: EndretUtbetalingAndelFeltnavn.ÅRSAK,
        control,
        rules: { required: 'Du må velge en årsak' },
    });

    return (
        <Select
            label={'Årsak'}
            value={value ?? ''}
            onChange={event => {
                const nyÅrsak = event.target.value ? (event.target.value as IEndretUtbetalingAndelÅrsak) : null;
                onChange(nyÅrsak);
                if (nyÅrsak !== IEndretUtbetalingAndelÅrsak.ALLEREDE_UTBETALT) {
                    setValue(EndretUtbetalingAndelFeltnavn.VEDTAKSBEGRUNNELSER, [], { shouldDirty: true });
                }
            }}
            onBlur={onBlur}
            ref={ref}
            error={error?.message}
            readOnly={erLesevisning}
        >
            <option value={''}>Velg årsak</option>
            {årsaker.map(årsak => (
                <option value={årsak} key={årsak}>
                    {årsakTekst[årsak]}
                </option>
            ))}
        </Select>
    );
}
