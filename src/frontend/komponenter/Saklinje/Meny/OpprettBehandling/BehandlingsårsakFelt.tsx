import { useFeatureToggles } from '@hooks/useFeatureToggles';
import {
    OpprettBehandlingFelt,
    type OpprettBehandlingFormValues,
} from '@komponenter/Saklinje/Meny/OpprettBehandling/useOpprettBehandlingSkjema';
import { behandlingÅrsak, BehandlingÅrsak, behandlingÅrsakerSomIkkeSkalSettesManuelt } from '@typer/behandling';
import { useController, useFormContext } from 'react-hook-form';

import { Select } from '@navikt/ds-react';

export function BehandlingsårsakFelt() {
    const toggles = useFeatureToggles();

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
            {Object.values(BehandlingÅrsak)
                .filter(
                    behandlingsårsak => !behandlingÅrsakerSomIkkeSkalSettesManuelt(toggles).includes(behandlingsårsak)
                )
                .map(årsak => {
                    return (
                        <option key={årsak} aria-selected={value === årsak} value={årsak}>
                            {behandlingÅrsak[årsak]}
                        </option>
                    );
                })}
        </Select>
    );
}
