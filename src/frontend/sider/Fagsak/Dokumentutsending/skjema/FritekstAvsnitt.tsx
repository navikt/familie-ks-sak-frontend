import { useErLesevisningFagsak } from '@hooks/useErLesevisningFagsak';
import { Textarea } from '@navikt/ds-react';
import type { ChangeEvent } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import type { DokumentutsendingFormValues } from '../useDokumentutsendingSkjema';
import { DokumentutsendingFeltnavn } from '../useDokumentutsendingSkjema';

const maksLengdeFritekstAvsnitt = 1000;

export function FritekstAvsnitt() {
    const erLesevisning = useErLesevisningFagsak();
    const {
        control,
        formState: { isSubmitting },
    } = useFormContext<DokumentutsendingFormValues>();

    const { field, fieldState } = useController({
        name: DokumentutsendingFeltnavn.FRITEKST_AVSNITT,
        control,
        rules: { required: 'Du må fylle inn en fritekst.' },
    });

    return (
        <Textarea
            label="Skriv inn fritekst"
            value={field.value}
            maxLength={maksLengdeFritekstAvsnitt}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => field.onChange(event.target.value)}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            autoFocus
            resize={'vertical'}
            readOnly={erLesevisning || isSubmitting}
        />
    );
}
