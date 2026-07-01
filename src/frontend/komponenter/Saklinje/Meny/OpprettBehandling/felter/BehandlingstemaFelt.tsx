import {
    OpprettBehandlingFelt,
    type OpprettBehandlingFormValues,
} from '@komponenter/Saklinje/Meny/OpprettBehandling/useOpprettBehandlingSkjema';
import { Behandlingstema } from '@typer/behandlingstema';
import { useController, useFormContext } from 'react-hook-form';

import { Select } from '@navikt/ds-react';

export function BehandlingstemaFelt() {
    const { control } = useFormContext<OpprettBehandlingFormValues>();
    const {
        field: { value, onChange },
        fieldState: { error },
        formState: { isSubmitting },
    } = useController({
        name: OpprettBehandlingFelt.BEHANDLINGSTEMA,
        control,
        rules: {
            required: 'Behandlingstema må velges.',
        },
    });

    return (
        <Select
            label={'Velg behandlingstema'}
            readOnly={isSubmitting}
            value={value}
            onChange={onChange}
            error={error?.message}
        >
            <option disabled={true} value={''}>
                Velg behandlingstema
            </option>
            <option aria-selected={value === Behandlingstema.NASJONAL} value={Behandlingstema.NASJONAL}>
                Nasjonal
            </option>
            <option aria-selected={value === Behandlingstema.EØS} value={Behandlingstema.EØS}>
                EØS
            </option>
        </Select>
    );
}
