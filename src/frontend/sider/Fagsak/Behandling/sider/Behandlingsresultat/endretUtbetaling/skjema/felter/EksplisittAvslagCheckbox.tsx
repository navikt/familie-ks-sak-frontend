import { Checkbox } from '@navikt/ds-react';
import { useController, useFormContext } from 'react-hook-form';

import {
    EndretUtbetalingAndelFeltnavn,
    type EndretUtbetalingAndelFormValues,
    type StandardFeltProps,
} from '../endretUtbetalingAndelSkjemaTyper';

export function EksplisittAvslagCheckbox({ erLesevisning }: StandardFeltProps) {
    const { control, trigger, formState } = useFormContext<EndretUtbetalingAndelFormValues>();

    const {
        field: { value, onChange },
    } = useController({
        name: EndretUtbetalingAndelFeltnavn.ER_EKSPLISITT_AVSLAG,
        control,
    });

    return (
        <Checkbox
            checked={value}
            onChange={event => {
                onChange(event.target.checked);
                if (formState.isSubmitted) {
                    trigger(EndretUtbetalingAndelFeltnavn.VEDTAKSBEGRUNNELSER);
                }
            }}
            readOnly={erLesevisning}
        >
            Vurderingen er et avslag
        </Checkbox>
    );
}
