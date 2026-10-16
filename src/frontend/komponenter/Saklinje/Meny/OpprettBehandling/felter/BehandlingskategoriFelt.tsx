import {
    OpprettBehandlingFelt,
    type OpprettBehandlingFormValues,
} from '@komponenter/Saklinje/Meny/OpprettBehandling/useOpprettBehandlingSkjema';
import { Select } from '@navikt/ds-react';
import { behandlingstemaer } from '@typer/behandlingstema';
import { useController, useFormContext } from 'react-hook-form';

export function BehandlingskategoriFelt() {
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
            <option disabled value={''}>
                Velg behandlingstema
            </option>
            {Object.values(behandlingstemaer).map(tema => {
                return (
                    <option key={tema.id} aria-selected={value !== undefined && value === tema.id} value={tema.id}>
                        {tema.navn}
                    </option>
                );
            })}
        </Select>
    );
}
