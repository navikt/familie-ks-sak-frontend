import { useRef } from 'react';

import { tidligsteRelevanteDato } from '@komponenter/Datovelger/utils';
import {
    OpprettBehandlingFelt,
    type OpprettBehandlingFormValues,
} from '@komponenter/Saklinje/Meny/OpprettBehandling/useOpprettBehandlingSkjema';
import { dateTilIsoDatoString, hentDagensDato } from '@utils/dato';
import { format, startOfDay } from 'date-fns';
import { useController, useFormContext } from 'react-hook-form';

import { DatePicker, type DateValidationT, useDatepicker } from '@navikt/ds-react';

export function SøknadMottattDatoFelt() {
    const { control, trigger } = useFormContext<OpprettBehandlingFormValues>();
    const dateValidationRef = useRef<DateValidationT | undefined>(undefined);

    // TODO: legg inn sjekk for søknadMottattDatoErMerEnn360DagerSiden ?

    const {
        field: { onChange },
        fieldState: { error },
        formState: { isSubmitting, isSubmitted },
    } = useController({
        name: OpprettBehandlingFelt.SØKNAD_MOTTATT_DATO,
        control,
        rules: {
            validate: value => {
                const dateValidation = dateValidationRef.current;

                if (dateValidation && dateValidation.isAfter) {
                    return 'Du kan ikke sette en dato som er frem i tid.';
                }

                if (dateValidation && dateValidation.isBefore) {
                    return `Du må velge en dato som er etter ${format(tidligsteRelevanteDato, 'dd.MM.yyyy')}.`;
                }

                if (dateValidation && (dateValidation.isInvalid || !dateValidation.isValidDate)) {
                    return 'Du må velge en gyldig dato.';
                }

                if (!value) {
                    return 'Du må velge en gyldig dato.';
                }

                return undefined;
            },
        },
    });

    const { datepickerProps, inputProps } = useDatepicker({
        onDateChange: dato => {
            onChange(dato ? dateTilIsoDatoString(startOfDay(dato)) : null);
            if (isSubmitted) {
                trigger(OpprettBehandlingFelt.SØKNAD_MOTTATT_DATO);
            }
        },
        fromDate: tidligsteRelevanteDato,
        toDate: hentDagensDato(), // TODO: dobbeltsjekk at dette blir riktig
        required: true,
        onValidate: validation => {
            dateValidationRef.current = validation;
            trigger(OpprettBehandlingFelt.SØKNAD_MOTTATT_DATO);
        },
    });

    return (
        <DatePicker {...datepickerProps}>
            <DatePicker.Input
                {...inputProps}
                label={'Søknad mottatt dato'}
                placeholder={'DD.MM.ÅÅÅÅ'}
                error={error?.message}
                readOnly={isSubmitting}
            />
        </DatePicker>
    );
}
