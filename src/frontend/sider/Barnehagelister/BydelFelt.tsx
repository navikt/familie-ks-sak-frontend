import { useHentBydeler } from '@hooks/useHentBydeler';
import { Select } from '@navikt/ds-react';
import type { BarnehagebarnFilter } from '@typer/barnehagebarn';
import { useController, useFormContext, useWatch } from 'react-hook-form';

import { erOslo } from './utils';

export function BydelFelt() {
    const { data: bydeler, isPending, isError } = useHentBydeler();
    const { control } = useFormContext<BarnehagebarnFilter>();
    const kommuneNavn = useWatch({ control, name: 'kommuneNavn' });

    const {
        field: { name, value, onChange, onBlur, ref },
    } = useController({ name: 'bydelOrganisasjonsnummer', control });

    return (
        <Select
            label="Bydel (Kun Oslo)"
            title="Filtrer på bydel i Oslo"
            size="medium"
            disabled={!erOslo(kommuneNavn) || isPending}
            error={isError ? 'Klarte ikke å hente bydeler' : undefined}
            ref={ref}
            name={name}
            onBlur={onBlur}
            onChange={event => onChange(event.target.value)}
            value={value}
        >
            <option value="">{isPending ? 'Henter bydeler …' : 'Alle bydeler'}</option>
            {bydeler?.map(bydel => (
                <option key={bydel.organisasjonsnummer} value={bydel.organisasjonsnummer}>
                    {bydel.navn}
                </option>
            ))}
        </Select>
    );
}
