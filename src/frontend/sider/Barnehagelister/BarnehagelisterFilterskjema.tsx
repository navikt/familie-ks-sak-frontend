import { FileResetIcon, FunnelIcon } from '@navikt/aksel-icons';
import { Box, Button, Checkbox, Fieldset, HelpText, HStack, TextField, VStack } from '@navikt/ds-react';
import type { BarnehagebarnFilter, BarnehagebarnRequestParams, Barnehagekommune } from '@typer/barnehagebarn';
import { FormProvider, type SubmitHandler, useForm } from 'react-hook-form';

import { BydelFelt } from './BydelFelt';
import { KommuneFelt } from './KommuneFelt';

interface BarnehagebarnFilterSkjemaProps {
    oppdaterFiltrering: (filter: BarnehagebarnFilter) => void;
    barnehageKommuner: () => Barnehagekommune[];
    barnehagebarnRequestParams: BarnehagebarnRequestParams;
}

const BarnehagelisterFilterskjema = (props: BarnehagebarnFilterSkjemaProps) => {
    const { oppdaterFiltrering, barnehageKommuner } = props;

    const form = useForm<BarnehagebarnFilter>({
        defaultValues: { ident: '', kommuneNavn: '', kunLøpendeAndel: false, bydelOrganisasjonsnummer: '' },
    });
    const { register, handleSubmit, reset, setValue } = form;

    const onSubmit: SubmitHandler<BarnehagebarnFilter> = barnehagebarnFilter => {
        oppdaterFiltrering(barnehagebarnFilter);
    };

    return (
        <FormProvider {...form}>
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
                                    {...register('ident', {
                                        onChange: event => {
                                            if (event.target.value.length > 0) {
                                                setValue('kommuneNavn', undefined);
                                                setValue('bydelOrganisasjonsnummer', '');
                                            }
                                        },
                                    })}
                                />
                                <Box width={'20rem'}>
                                    <KommuneFelt kommuner={barnehageKommuner()} />
                                </Box>
                                <Box width={'20rem'}>
                                    <BydelFelt />
                                </Box>
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
        </FormProvider>
    );
};

export default BarnehagelisterFilterskjema;
