import { EØS_LAND_REGIONKODER, RegionCombobox, type Regionkode } from '@komponenter/FlaggCombobox';
import { useController, useFormContext } from 'react-hook-form';

import { type BrevModulFormValues, BrevmodulFeltnavn } from './useBrevModul';
import { useSkjemaErLåst } from './useSkjemaErLåst';

export function MottakerlandSedField() {
    const skjemaErLåst = useSkjemaErLåst();
    const { control } = useFormContext<BrevModulFormValues>();

    const { field } = useController({
        name: BrevmodulFeltnavn.MOTTAKERLAND_SED,
        control,
    });

    return (
        <RegionCombobox
            label={'SED er sendt til'}
            value={(field.value ?? []) as Regionkode[]}
            options={EØS_LAND_REGIONKODER}
            onChange={value => field.onChange(value ?? [])}
            readOnly={skjemaErLåst}
            isMulti
        />
    );
}
