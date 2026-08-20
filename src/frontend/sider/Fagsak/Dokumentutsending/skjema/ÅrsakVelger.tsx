import type { ChangeEvent } from 'react';

import { useController, useFormContext } from 'react-hook-form';

import { Select } from '@navikt/ds-react';

import { dokumentÅrsak, DokumentÅrsak } from '../dokumentÅrsakTyper';
import type { DokumentutsendingFormValues } from './useDokumentutsendingSkjema';
import { DokumentutsendingFeltnavn } from './useDokumentutsendingSkjema';

export function ÅrsakVelger() {
    const { control } = useFormContext<DokumentutsendingFormValues>();

    const { field, fieldState } = useController({
        name: DokumentutsendingFeltnavn.ÅRSAK,
        control,
        rules: { required: 'Du må velge en årsak' },
    });

    return (
        <Select
            label={'Velg årsak'}
            value={field.value}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => field.onChange(event.target.value)}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            size={'medium'}
        >
            <option value="">Velg</option>
            {Object.values(DokumentÅrsak).map(årsak => (
                <option key={årsak} aria-selected={field.value === årsak} value={årsak}>
                    {dokumentÅrsak[årsak]}
                </option>
            ))}
        </Select>
    );
}
