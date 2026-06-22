import {
    OpprettBehandlingFelt,
    type OpprettBehandlingFormValues,
} from '@komponenter/Saklinje/Meny/OpprettBehandling/useOpprettBehandlingSkjema';
import type { IBehandlingstema } from '@typer/behandlingstema';
import { behandlingstemaer } from '@typer/behandlingstema';
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

    const konverterTilBehandlingstema = (behandlingstemaId: string): IBehandlingstema => {
        return behandlingstemaer[behandlingstemaId as keyof typeof behandlingstemaer];
    };

    return (
        <Select
            label={'Velg behandlingstema'}
            readOnly={isSubmitting}
            value={value?.id}
            onChange={event => {
                onChange(konverterTilBehandlingstema(event.target.value));
            }}
            error={error?.message}
        >
            <option disabled={true} value={''} aria-selected={true}>
                Velg behandlingstema
            </option>
            {Object.values(behandlingstemaer).map(tema => {
                return (
                    <option key={tema.id} aria-selected={value !== undefined && value.id === tema.id} value={tema.id}>
                        {tema.navn}
                    </option>
                );
            })}
        </Select>
    );
}
