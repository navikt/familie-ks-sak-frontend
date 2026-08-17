import { Målform, målform } from '@typer/søknad';
import { useController, useFormContext } from 'react-hook-form';

import { Box, Heading, Radio, RadioGroup } from '@navikt/ds-react';

import type { DokumentutsendingFormValues } from './useDokumentutsendingSkjema';
import { DokumentutsendingFeltnavn } from './useDokumentutsendingSkjema';

export function MålformVelger() {
    const { control } = useFormContext<DokumentutsendingFormValues>();

    const { field } = useController({
        name: DokumentutsendingFeltnavn.MÅLFORM,
        control,
    });

    return (
        <RadioGroup value={målform[field.value]} legend={<Heading size={'medium'} level={'2'} children={'Målform'} />}>
            <Box paddingInline={'space-16 space-0'}>
                <Radio
                    value={målform[Målform.NB]}
                    name={'dokumentutsending-målform'}
                    checked={field.value === Målform.NB}
                    onChange={() => field.onChange(Målform.NB)}
                    id={'målform-nb'}
                >
                    {målform[Målform.NB]}
                </Radio>
                <Radio
                    value={målform[Målform.NN]}
                    name={'dokumentutsending-målform'}
                    checked={field.value === Målform.NN}
                    onChange={() => field.onChange(Målform.NN)}
                >
                    {målform[Målform.NN]}
                </Radio>
            </Box>
        </RadioGroup>
    );
}
