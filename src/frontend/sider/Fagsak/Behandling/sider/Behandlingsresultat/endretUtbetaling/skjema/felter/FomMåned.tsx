import { useBehandling } from '@hooks/useBehandling';
import { MonthPicker, type MonthValidationT, useMonthpicker } from '@navikt/ds-react';
import { Datoformat, dateTilFormatertString, dateTilIsoMånedÅrString, isoStringTilDate } from '@utils/dato';
import { useRef } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import {
    EndretUtbetalingAndelFeltnavn,
    type EndretUtbetalingAndelFormValues,
    type StandardFeltProps,
} from '../endretUtbetalingAndelSkjemaTyper';
import { hentMånedsgrenser } from './månedsgrenser';

export function FomMåned({ erLesevisning }: StandardFeltProps) {
    const behandling = useBehandling();
    const { control, trigger, getValues } = useFormContext<EndretUtbetalingAndelFormValues>();

    const monthValidationRef = useRef<MonthValidationT | undefined>(undefined);
    const { tidligsteMåned, senesteMåned } = hentMånedsgrenser(behandling);

    const {
        field: { value, onChange },
        fieldState: { error },
        formState: { isSubmitted },
    } = useController({
        name: EndretUtbetalingAndelFeltnavn.FOM,
        control,
        rules: {
            validate: value => {
                const monthValidation = monthValidationRef.current;
                if (monthValidation?.isBefore) {
                    return `Valgt måned kan ikke være før ${dateTilFormatertString({ date: tidligsteMåned, tilFormat: Datoformat.MÅNED_ÅR_NAVN })}`;
                }
                if (monthValidation?.isAfter) {
                    return `Valgt måned kan ikke være etter ${dateTilFormatertString({ date: senesteMåned, tilFormat: Datoformat.MÅNED_ÅR_NAVN })}`;
                }
                if (monthValidation && !monthValidation.isEmpty && !monthValidation.isValidMonth) {
                    return 'Du må velge en gyldig måned';
                }
                if (!value) {
                    return 'Du må velge f.o.m-dato';
                }
                return undefined;
            },
        },
    });

    const { monthpickerProps, inputProps } = useMonthpicker({
        defaultSelected: value ? isoStringTilDate(value) : undefined,
        fromDate: tidligsteMåned,
        toDate: senesteMåned,
        onMonthChange: dato => {
            onChange(dato ? dateTilIsoMånedÅrString(dato) : null);
            if (isSubmitted && getValues(EndretUtbetalingAndelFeltnavn.TOM)) {
                trigger(EndretUtbetalingAndelFeltnavn.TOM);
            }
        },
        onValidate: validation => {
            monthValidationRef.current = validation;
        },
    });

    return (
        <MonthPicker {...monthpickerProps} dropdownCaption>
            <MonthPicker.Input {...inputProps} label={'F.o.m'} readOnly={erLesevisning} error={error?.message} />
        </MonthPicker>
    );
}
