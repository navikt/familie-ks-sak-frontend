import {
    OpprettBehandlingFelt,
    type OpprettBehandlingFormValues,
} from '@komponenter/Saklinje/Meny/OpprettBehandling/useOpprettBehandlingSkjema';
import { Select } from '@navikt/ds-react';
import { behandlingÅrsak } from '@typer/behandling';
import { hentTilgjengeligeBehandlingsårsaker } from '@utils/behandling';
import { useController, useFormContext } from 'react-hook-form';

export function BehandlingsårsakFelt() {
    const { control } = useFormContext<OpprettBehandlingFormValues>();
    const {
        field: { value, onChange },
        fieldState: { error },
        formState: { isSubmitting },
    } = useController({
        name: OpprettBehandlingFelt.BEHANDLINGSÅRSAK,
        control,
        rules: {
            required: 'Velg årsak for opprettelse av behandlingen fra nedtrekkslisten.',
        },
    });

    return (
        <Select
            label={'Velg behandlingsårsak'}
            readOnly={isSubmitting}
            value={value}
            onChange={onChange}
            error={error?.message}
        >
            <option disabled={true} value={''}>
                Velg
            </option>
            {hentTilgjengeligeBehandlingsårsaker().map(årsak => {
                return (
                    <option key={årsak} aria-selected={value === årsak} value={årsak}>
                        {behandlingÅrsak[årsak]}
                    </option>
                );
            })}
        </Select>
    );
}
