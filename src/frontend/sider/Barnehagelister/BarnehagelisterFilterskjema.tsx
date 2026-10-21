import { FileResetIcon, FunnelIcon } from '@navikt/aksel-icons';
import {
    Box,
    Button,
    Checkbox,
    Fieldset,
    HelpText,
    HStack,
    Select,
    TextField,
    UNSAFE_Combobox,
    VStack,
} from '@navikt/ds-react';
import type { BarnehagebarnFilter, BarnehagebarnRequestParams, Barnehagekommune } from '@typer/barnehagebarn';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';

import { useHentBydeler } from '../../hooks/useHentBydeler';

interface BarnehagebarnFilterSkjemaProps {
    oppdaterFiltrering: (filter: BarnehagebarnFilter) => void;
    barnehageKommuner: () => Barnehagekommune[];
    barnehagebarnRequestParams: BarnehagebarnRequestParams;
}

const erOslo = (kommuneNavn?: string) => kommuneNavn?.toLowerCase() === 'oslo';

const BarnehagelisterFilterskjema = (props: BarnehagebarnFilterSkjemaProps) => {
    const { oppdaterFiltrering, barnehageKommuner } = props;

    const { data: bydeler, isError: harFeiletÅHenteBydeler } = useHentBydeler();

    const { register, handleSubmit, reset, control, watch, setValue } = useForm<BarnehagebarnFilter>({
        defaultValues: { ident: '', kommuneNavn: '', kunLøpendeAndel: false, bydelOrgNummer: '' },
    });

    const onSubmit: SubmitHandler<BarnehagebarnFilter> = barnehagebarnFilter => {
        oppdaterFiltrering(barnehagebarnFilter);
    };

    const ident = watch('ident');
    const kommuneNavn = watch('kommuneNavn');

    useEffect(() => {
        if (!erOslo(kommuneNavn)) {
            setValue('bydelOrgNummer', '');
        }
    }, [kommuneNavn, setValue]);

    if (ident && ident.length > 0) {
        setValue('kommuneNavn', undefined);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Box marginBlock={'space-0 space-32'}>
                <Fieldset
                    size="small"
                    aria-label="BarnehagelisterInnhold filterskjema"
                    legend="Filterskjema"
                    description="Filtrer barnehagebarn resultater"
                    hideLegend
                >
                    <VStack gap="space-16">
                        <HStack gap="space-16" align="end">
                            <TextField
                                label="Barns ident"
                                title="Filtrer på barns ident"
                                size="medium"
                                maxLength={11}
                                {...register('ident')}
                            />
                            <Controller
                                control={control}
                                name={'kommuneNavn'}
                                render={({ field }) => (
                                    <UNSAFE_Combobox
                                        label="Kommunenavn"
                                        selectedOptions={field.value != undefined ? [field.value] : []}
                                        options={barnehageKommuner()}
                                        title="Filtrer på kommunenavn"
                                        size="medium"
                                        ref={field.ref}
                                        name={field.name}
                                        onBlur={field.onBlur}
                                        onToggleSelected={(option, isSelected): void => {
                                            setValue('ident', undefined);
                                            if (isSelected) {
                                                field.onChange(option);
                                            } else {
                                                field.onChange(null);
                                            }
                                        }}
                                        shouldAutocomplete={true}
                                    />
                                )}
                            />
                            <Controller
                                control={control}
                                name={'bydelOrgNummer'}
                                render={({ field }) => (
                                    <Select
                                        label="Bydel (Kun Oslo)"
                                        title="Filtrer på bydel i Oslo"
                                        size="medium"
                                        disabled={!erOslo(kommuneNavn)}
                                        error={harFeiletÅHenteBydeler ? 'Klarte ikke å hente bydeler' : undefined}
                                        ref={field.ref}
                                        name={field.name}
                                        onBlur={field.onBlur}
                                        onChange={field.onChange}
                                        value={field.value}
                                    >
                                        <option value="">Alle bydeler</option>
                                        {bydeler?.map(bydel => (
                                            <option key={bydel.organisasjonsnummer} value={bydel.organisasjonsnummer}>
                                                {bydel.navn}
                                            </option>
                                        ))}
                                    </Select>
                                )}
                            />
                            <HStack gap="space-16" align="center">
                                <Checkbox
                                    id="kun-loepende-andel"
                                    title="Vis kun løpende andeler"
                                    size="medium"
                                    {...register('kunLøpendeAndel')}
                                >
                                    Kun løpende utbetalinger
                                </Checkbox>
                                <HelpText title="Løpende utbetaling">
                                    Viser kun saker hvor barn har en løpende utbetaling
                                </HelpText>
                            </HStack>
                        </HStack>
                        <HStack gap="space-16">
                            <Button type="submit" variant="primary" size="medium" icon={<FunnelIcon aria-hidden />}>
                                Filtrer
                            </Button>
                            <Button
                                variant="secondary"
                                size="medium"
                                onClick={() => {
                                    reset();
                                }}
                                icon={<FileResetIcon aria-hidden />}
                            >
                                Fjern filtre
                            </Button>
                        </HStack>
                    </VStack>
                </Fieldset>
            </Box>
        </form>
    );
};

export default BarnehagelisterFilterskjema;
