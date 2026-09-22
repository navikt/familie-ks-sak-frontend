import type { ChangeEvent } from 'react';

import { useController, useFormContext } from 'react-hook-form';

import { Select } from '@navikt/ds-react';

import { type Brevmal, type BrevtypeSelect, brevmaler } from './typer';
import { type BrevModulFormValues, BrevmodulFeltnavn } from './useBrevModul';
import { useSkjemaErLåst } from './useSkjemaErLåst';

interface Props {
    brevMaler: Brevmal[];
    onEndreBrevmal: (nyBrevmal: Brevmal | '') => void;
}

export function BrevmalSelect({ brevMaler, onEndreBrevmal }: Props) {
    const { control } = useFormContext<BrevModulFormValues>();
    const skjemaErLåst = useSkjemaErLåst();

    const {
        field,
        fieldState: { error },
    } = useController({
        name: BrevmodulFeltnavn.BREVMAL,
        control,
        rules: { validate: verdi => (verdi ? true : 'Du må velge en brevmal') },
    });

    return (
        <Select
            id={'velg-brevmal'}
            label={'Velg brevmal'}
            value={field.value}
            error={error?.message}
            readOnly={skjemaErLåst}
            onChange={(event: ChangeEvent<BrevtypeSelect>): void => onEndreBrevmal(event.target.value as Brevmal | '')}
        >
            <option value={''}>Velg</option>
            {brevMaler.map(mal => (
                <option aria-selected={mal === field.value} key={mal} value={mal}>
                    {brevmaler[mal]}
                </option>
            ))}
        </Select>
    );
}
