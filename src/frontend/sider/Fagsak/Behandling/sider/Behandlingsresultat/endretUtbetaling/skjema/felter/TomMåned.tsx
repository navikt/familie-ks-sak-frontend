import { useBehandling } from '@hooks/useBehandling';
import { MonthPicker, type MonthValidationT, useMonthpicker } from '@navikt/ds-react';
import { Datoformat, dateTilFormatertString, dateTilIsoMånedÅrString, isoStringTilDate } from '@utils/dato';
import { max } from 'date-fns';
import { useRef } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import {
    EndretUtbetalingAndelFeltnavn,
    type EndretUtbetalingAndelFormValues,
    type StandardFeltProps,
} from '../endretUtbetalingAndelSkjemaTyper';
import { hentMånedsgrenser } from './månedsgrenser';

export function TomMåned({ erLesevisning }: StandardFeltProps) {
    const behandling = useBehandling();
    const { control, getValues, watch } = useFormContext<EndretUtbetalingAndelFormValues>();

    const monthValidationRef = useRef<MonthValidationT | undefined>(undefined);
    const { tidligsteMåned, senesteMåned } = hentMånedsgrenser(behandling);

    const fom = watch(EndretUtbetalingAndelFeltnavn.FOM);
    const fraMåned = fom ? max([tidligsteMåned, isoStringTilDate(fom)]) : tidligsteMåned;

    const {
        field: { value, onChange },
        fieldState: { error },
    } = useController({
        name: EndretUtbetalingAndelFeltnavn.TOM,
        control,
        rules: {
            validate: value => {
                const monthValidation = monthValidationRef.current;
                if (monthValidation?.isAfter) {
                    return `Valgt måned kan ikke være etter ${dateTilFormatertString({ date: senesteMåned, tilFormat: Datoformat.MÅNED_ÅR_NAVN })}`;
                }
                if (monthValidation && !monthValidation.isEmpty && !monthValidation.isValidMonth) {
                    return 'Du må velge en gyldig måned';
                }
                if (!value) {
                    return 'Du må velge t.o.m-dato';
                }
                const gjeldendeFom = getValues(EndretUtbetalingAndelFeltnavn.FOM);
                if (gjeldendeFom && value < gjeldendeFom) {
                    return 'T.o.m. kan ikke være før f.o.m.';
                }
                return undefined;
            },
        },
    });

    const { monthpickerProps, inputProps } = useMonthpicker({
        defaultSelected: value ? isoStringTilDate(value) : undefined,
        fromDate: fraMåned,
        toDate: senesteMåned,
        onMonthChange: dato => onChange(dato ? dateTilIsoMånedÅrString(dato) : null),
        onValidate: validation => {
            monthValidationRef.current = validation;
        },
    });

    return (
        <MonthPicker {...monthpickerProps} dropdownCaption>
            <MonthPicker.Input {...inputProps} label={'T.o.m'} readOnly={erLesevisning} error={error?.message} />
        </MonthPicker>
    );
}
