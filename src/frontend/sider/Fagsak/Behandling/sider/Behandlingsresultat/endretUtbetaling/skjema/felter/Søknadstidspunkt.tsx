import { DatePicker, type DateValidationT, useDatepicker } from '@navikt/ds-react';
import { dateTilIsoDatoString, isoStringTilDate } from '@utils/dato';
import { startOfToday } from 'date-fns';
import { useRef } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import {
    EndretUtbetalingAndelFeltnavn,
    type EndretUtbetalingAndelFormValues,
    type StandardFeltProps,
} from '../endretUtbetalingAndelSkjemaTyper';

export function Søknadstidspunkt({ erLesevisning }: StandardFeltProps) {
    const { control } = useFormContext<EndretUtbetalingAndelFormValues>();

    const dateValidationRef = useRef<DateValidationT | undefined>(undefined);

    const {
        field: { value, onChange },
        fieldState: { error },
    } = useController({
        name: EndretUtbetalingAndelFeltnavn.SØKNADSTIDSPUNKT,
        control,
        rules: {
            validate: value => {
                const dateValidation = dateValidationRef.current;
                if (dateValidation?.isAfter) {
                    return 'Du kan ikke velge en dato frem i tid';
                }
                if (dateValidation && !dateValidation.isEmpty && !dateValidation.isValidDate) {
                    return 'Du må velge en gyldig dato';
                }
                if (!value) {
                    return 'Du må velge en gyldig dato';
                }
                return undefined;
            },
        },
    });

    const { datepickerProps, inputProps } = useDatepicker({
        defaultSelected: value ? isoStringTilDate(value) : undefined,
        toDate: startOfToday(),
        onDateChange: dato => onChange(dato ? dateTilIsoDatoString(dato) : null),
        onValidate: validation => {
            dateValidationRef.current = validation;
        },
    });

    return (
        <DatePicker {...datepickerProps} dropdownCaption>
            <DatePicker.Input
                {...inputProps}
                label={'Søknadstidspunkt'}
                placeholder={'DD.MM.ÅÅÅÅ'}
                readOnly={erLesevisning}
                error={error?.message}
            />
        </DatePicker>
    );
}
