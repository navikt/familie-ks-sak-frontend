import { Textarea } from '@navikt/ds-react';
import { useController, useFormContext } from 'react-hook-form';

import {
    EndretUtbetalingAndelFeltnavn,
    type EndretUtbetalingAndelFormValues,
    type StandardFeltProps,
} from '../endretUtbetalingAndelSkjemaTyper';

export function Begrunnelse({ erLesevisning }: StandardFeltProps) {
    const { control } = useFormContext<EndretUtbetalingAndelFormValues>();

    const {
        field,
        fieldState: { error },
    } = useController({
        name: EndretUtbetalingAndelFeltnavn.BEGRUNNELSE,
        control,
        rules: { required: 'Du må oppgi en begrunnelse.' },
    });

    return (
        <Textarea
            {...field}
            label={'Begrunnelse'}
            placeholder={'Begrunn hvorfor utbetalingsperioden er endret.'}
            minRows={5}
            error={error?.message}
            readOnly={erLesevisning}
        />
    );
}
