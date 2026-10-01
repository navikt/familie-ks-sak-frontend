import { useBehandling } from '@hooks/useBehandling';
import { UNSAFE_Combobox } from '@navikt/ds-react';
import { lagPersonLabel } from '@utils/formatter';
import { useController, useFormContext } from 'react-hook-form';

import {
    EndretUtbetalingAndelFeltnavn,
    type EndretUtbetalingAndelFormValues,
    type StandardFeltProps,
} from '../endretUtbetalingAndelSkjemaTyper';

export function Personvelger({ erLesevisning }: StandardFeltProps) {
    const behandling = useBehandling();
    const { control } = useFormContext<EndretUtbetalingAndelFormValues>();

    const {
        field: { value, onChange, onBlur, ref },
        fieldState: { error },
    } = useController({
        name: EndretUtbetalingAndelFeltnavn.PERSONER,
        control,
        rules: { validate: value => value.length > 0 || 'Du må velge minst én person' },
    });

    const identerMedAndeler = behandling.personerMedAndelerTilkjentYtelse.map(person => person.personIdent);
    const tilgjengeligePersoner = behandling.personer
        .filter(person => identerMedAndeler.includes(person.personIdent))
        .map(person => ({
            value: person.personIdent,
            label: lagPersonLabel(person.personIdent, behandling.personer),
        }));

    const valgtePersoner = value.map(ident => ({
        value: ident,
        label: lagPersonLabel(ident, behandling.personer),
    }));

    return (
        <UNSAFE_Combobox
            isMultiSelect
            label={'Velg hvem det gjelder'}
            options={tilgjengeligePersoner}
            selectedOptions={valgtePersoner}
            onToggleSelected={(ident, erValgt) =>
                onChange(erValgt ? [...value, ident] : value.filter(valgtIdent => valgtIdent !== ident))
            }
            onBlur={onBlur}
            ref={ref}
            readOnly={erLesevisning}
            error={error?.message}
        />
    );
}
