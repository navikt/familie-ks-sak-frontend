import { useRef } from 'react';

import { useErLesevisning } from '@hooks/useErLesevisning';
import { tidligsteRelevanteDato } from '@komponenter/Datovelger/utils';
import { hentDagensDato } from '@utils/dato';
import { useController, useFormContext } from 'react-hook-form';

import { DatePicker, type DateValidationT, useDatepicker } from '@navikt/ds-react';

import { validerAdopsjonsdato } from './BarnetsAlderValidering';
import { VilkårResultatFelt, type VilkårResultatFormValues } from '../../useVilkårResultatSkjema';

interface Props {
    fødselsdato: Date;
}

export function AdopsjonsdatoFelt({ fødselsdato }: Props) {
    const erLesevisning = useErLesevisning();

    const { control, trigger } = useFormContext<VilkårResultatFormValues>();

    const dateValidationRef = useRef<DateValidationT | undefined>(undefined);

    const {
        field: { value, onChange, ref },
        fieldState: { error },
        formState: { isSubmitting, isSubmitted },
    } = useController({
        name: VilkårResultatFelt.ADOPSJONSDATO,
        control,
        rules: {
            validate: adopsjonsdato => {
                const dateValidation = dateValidationRef.current;
                if (dateValidation && !dateValidation.isEmpty) {
                    if (dateValidation.isAfter) {
                        return 'Du kan ikke sette en dato som er frem i tid';
                    }
                    if (dateValidation.isInvalid) {
                        return 'Du må velge en gyldig dato';
                    }
                }
                return validerAdopsjonsdato(adopsjonsdato, fødselsdato);
            },
        },
    });

    const { datepickerProps, inputProps } = useDatepicker({
        defaultSelected: value ?? undefined,
        fromDate: tidligsteRelevanteDato,
        toDate: hentDagensDato(),
        onDateChange: dato => {
            onChange(dato);
            if (isSubmitted) {
                trigger(VilkårResultatFelt.ADOPSJONSDATO);
            }
        },
        onValidate: validation => {
            dateValidationRef.current = validation;
            if (isSubmitted) {
                trigger(VilkårResultatFelt.ADOPSJONSDATO);
            }
        },
    });

    return (
        <DatePicker dropdownCaption {...datepickerProps}>
            <DatePicker.Input
                {...inputProps}
                ref={ref}
                label={'Adopsjonsdato'}
                placeholder={'DD.MM.ÅÅÅÅ'}
                readOnly={erLesevisning || isSubmitting}
                error={error?.message}
            />
        </DatePicker>
    );
}
