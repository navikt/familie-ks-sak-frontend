import { useBruker } from '@hooks/useBruker';
import { useErLesevisningFagsak } from '@hooks/useErLesevisningFagsak';
import { Select } from '@navikt/ds-react';
import type { ChangeEvent } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { DokumentÅrsak, dokumentÅrsak } from '../dokumentÅrsakTyper';
import type { DokumentutsendingFormValues } from '../useDokumentutsendingSkjema';
import { DokumentutsendingFeltnavn, dokumentutsendingSkjemaStandardverdier } from '../useDokumentutsendingSkjema';

export function ÅrsakVelger() {
    const erLesevisning = useErLesevisningFagsak();
    const bruker = useBruker();
    const {
        control,
        reset,
        getValues,
        formState: { isSubmitting },
    } = useFormContext<DokumentutsendingFormValues>();

    const { field, fieldState } = useController({
        name: DokumentutsendingFeltnavn.ÅRSAK,
        control,
        rules: { required: 'Du må velge en årsak' },
    });

    const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const nyÅrsak = event.target.value as DokumentÅrsak | '';
        reset({
            ...dokumentutsendingSkjemaStandardverdier(bruker),
            [DokumentutsendingFeltnavn.ÅRSAK]: nyÅrsak,
            [DokumentutsendingFeltnavn.MÅLFORM]: getValues(DokumentutsendingFeltnavn.MÅLFORM),
        });
    };

    return (
        <Select
            label={'Velg årsak'}
            value={field.value}
            onChange={onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            size={'medium'}
            readOnly={erLesevisning || isSubmitting}
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
