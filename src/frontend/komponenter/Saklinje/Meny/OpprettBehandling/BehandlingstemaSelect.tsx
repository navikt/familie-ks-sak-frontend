import {
    OpprettBehandlingFelt,
    type OpprettBehandlingFormValues,
} from '@komponenter/Saklinje/Meny/OpprettBehandling/useOpprettBehandlingSkjema';
import { BehandlingKategori } from '@typer/behandlingstema';
import { useController, useFormContext } from 'react-hook-form';

import { Select } from '@navikt/ds-react';

export function BehandlingstemaSelect() {
    const { control } = useFormContext<OpprettBehandlingFormValues>();
    const {
        field: { value, onChange },
        fieldState: { error },
        formState: { isSubmitting },
    } = useController({
        name: OpprettBehandlingFelt.BEHANDLINGSKATEGORI,
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
            <option disabled={true} value={''} aria-selected={true}>
                Velg behandlingstema
            </option>
            <option aria-selected={value === BehandlingKategori.NASJONAL} value={BehandlingKategori.NASJONAL}>
                Nasjonal
            </option>
            <option aria-selected={value === BehandlingKategori.EØS} value={BehandlingKategori.EØS}>
                EØS
            </option>
        </Select>
    );
}
