import { Radio, RadioGroup } from '@navikt/ds-react';
import { useController, useFormContext } from 'react-hook-form';

import {
    EndretUtbetalingAndelFeltnavn,
    type EndretUtbetalingAndelFormValues,
    type StandardFeltProps,
} from '../endretUtbetalingAndelSkjemaTyper';

export function Utbetalingvelger({ erLesevisning }: StandardFeltProps) {
    const { control, setValue } = useFormContext<EndretUtbetalingAndelFormValues>();

    const {
        field: { value, onChange },
        fieldState: { error },
    } = useController({
        name: EndretUtbetalingAndelFeltnavn.PERIODE_SKAL_UTBETALES,
        control,
        rules: {
            validate: value => value !== null || 'Du må velge om perioden skal utbetales',
        },
    });

    return (
        <RadioGroup
            legend={'Utbetaling'}
            value={value}
            onChange={(nyVerdi: boolean) => {
                onChange(nyVerdi);
                setValue(EndretUtbetalingAndelFeltnavn.ER_EKSPLISITT_AVSLAG, false, { shouldDirty: true });
            }}
            error={error?.message}
            readOnly={erLesevisning}
        >
            <Radio value={true}>Perioden skal utbetales</Radio>
            <Radio value={false}>Perioden skal ikke utbetales</Radio>
        </RadioGroup>
    );
}
