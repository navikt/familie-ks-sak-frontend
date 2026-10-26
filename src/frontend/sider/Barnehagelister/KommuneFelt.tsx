import { UNSAFE_Combobox } from '@navikt/ds-react';
import type { BarnehagebarnFilter, Barnehagekommune } from '@typer/barnehagebarn';
import { useController, useFormContext } from 'react-hook-form';

import { erOslo } from './utils';

interface Props {
    kommuner: Barnehagekommune[];
}

export function KommuneFelt({ kommuner }: Props) {
    const { control, setValue } = useFormContext<BarnehagebarnFilter>();

    const {
        field: { name, value, onChange, onBlur, ref },
    } = useController({ name: 'kommuneNavn', control });

    return (
        <UNSAFE_Combobox
            label="Kommunenavn"
            selectedOptions={value != undefined ? [value] : []}
            options={kommuner}
            title="Filtrer på kommunenavn"
            size="medium"
            ref={ref}
            name={name}
            onBlur={onBlur}
            onToggleSelected={(option, isSelected): void => {
                setValue('ident', undefined);
                if (!isSelected || !erOslo(option)) {
                    setValue('bydelOrganisasjonsnummer', '');
                }
                if (isSelected) {
                    onChange(option);
                } else {
                    onChange(null);
                }
            }}
            shouldAutocomplete={true}
        />
    );
}
