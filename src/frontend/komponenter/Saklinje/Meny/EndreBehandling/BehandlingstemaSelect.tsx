import { useController, useFormContext } from 'react-hook-form';

import { Select } from '@navikt/ds-react';

import { EndreBehandlingstemaFelt, type EndreBehandlingstemaFormValues } from './useEndreBehandlingstemaSkjema';
import { useBehandlingContext } from '../../../../sider/Fagsak/Behandling/context/BehandlingContext';
import type { IBehandlingstema } from '../../../../typer/behandlingstema';
import { behandlingstemaer } from '../../../../typer/behandlingstema';

export const BehandlingstemaSelect = () => {
    const { vurderErLesevisning } = useBehandlingContext();

    const { control } = useFormContext<EndreBehandlingstemaFormValues>();
    const {
        field: { value, onChange },
        fieldState: { error },
        formState: { isSubmitting },
    } = useController({
        name: EndreBehandlingstemaFelt.BEHANDLINGSTEMA,
        control,
        rules: {
            required: 'Behandlingstema må velges.',
        },
    });

    const erLesevisning = vurderErLesevisning();

    const konverterTilBehandlingstema = (behandlingstemaId: string): IBehandlingstema => {
        return behandlingstemaer[behandlingstemaId as keyof typeof behandlingstemaer];
    };

    return (
        <Select
            label={'Velg behandlingstema'}
            readOnly={isSubmitting || erLesevisning}
            value={value.id}
            onChange={event => {
                onChange(konverterTilBehandlingstema(event.target.value));
            }}
            error={error?.message}
        >
            {Object.values(behandlingstemaer).map(tema => {
                return (
                    <option key={tema.id} aria-selected={value.id === tema.id} value={tema.id}>
                        {tema.navn}
                    </option>
                );
            })}
        </Select>
    );
};
