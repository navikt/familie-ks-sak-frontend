import { useHentEndretUtbetalingBegrunnelser } from '@hooks/useHentEndretUtbetalingBegrunnelser';
import { LocalAlert, Select } from '@navikt/ds-react';
import { IEndretUtbetalingAndelÅrsak } from '@typer/utbetalingAndel';
import { BegrunnelseType, begrunnelseTyper } from '@typer/vedtak';
import { useController, useFormContext } from 'react-hook-form';

import {
    EndretUtbetalingAndelFeltnavn,
    type EndretUtbetalingAndelFormValues,
    type StandardFeltProps,
} from '../endretUtbetalingAndelSkjemaTyper';

export function AvslagBegrunnelsevelger({ erLesevisning }: StandardFeltProps) {
    const { data: endretUtbetalingsbegrunnelser, isError, isPending } = useHentEndretUtbetalingBegrunnelser();
    const { control, getValues } = useFormContext<EndretUtbetalingAndelFormValues>();

    const {
        field: { value, onChange, onBlur, ref },
        fieldState: { error },
    } = useController({
        name: EndretUtbetalingAndelFeltnavn.VEDTAKSBEGRUNNELSER,
        control,
        rules: {
            validate: value => {
                const erAlleredeUtbetalt =
                    getValues(EndretUtbetalingAndelFeltnavn.ÅRSAK) === IEndretUtbetalingAndelÅrsak.ALLEREDE_UTBETALT;
                const erEksplisittAvslag = getValues(EndretUtbetalingAndelFeltnavn.ER_EKSPLISITT_AVSLAG);
                if (erAlleredeUtbetalt && erEksplisittAvslag && value.length === 0) {
                    return 'Du må velge en begrunnelse ved avslag';
                }
                return undefined;
            },
        },
    });

    if (isError) {
        return (
            <LocalAlert status="error">
                <LocalAlert.Header>
                    <LocalAlert.Title>Klarte ikke å hente inn begrunnelser for endret utbetaling.</LocalAlert.Title>
                </LocalAlert.Header>
            </LocalAlert>
        );
    }

    const avslagsbegrunnelser = (endretUtbetalingsbegrunnelser?.[BegrunnelseType.AVSLAG] ?? []).filter(begrunnelse =>
        begrunnelse.endringsårsaker.includes(IEndretUtbetalingAndelÅrsak.ALLEREDE_UTBETALT)
    );

    return (
        <Select
            label={'Velg standardtekst i brev'}
            value={value[0] ?? ''}
            onChange={event => onChange(event.target.value ? [event.target.value] : [])}
            onBlur={onBlur}
            ref={ref}
            error={error?.message}
            readOnly={erLesevisning || isPending}
        >
            <option disabled hidden value={''}>
                Velg begrunnelse
            </option>
            <optgroup label={begrunnelseTyper[BegrunnelseType.AVSLAG]}>
                {avslagsbegrunnelser.map(begrunnelse => (
                    <option value={begrunnelse.id} key={begrunnelse.id}>
                        {begrunnelse.navn}
                    </option>
                ))}
            </optgroup>
        </Select>
    );
}
