import React from 'react';

import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import styled from 'styled-components';

import { FunnelIcon, FileResetIcon } from '@navikt/aksel-icons';
import {
    Button,
    Checkbox,
    Fieldset,
    HStack,
    TextField,
    UNSAFE_Combobox,
    VStack,
} from '@navikt/ds-react';

import type {
    IBarnehagebarnFilter,
    IBarnehagebarnRequestParams,
    IBarnehagekommune,
} from '../../typer/barnehagebarn';

const StyledFieldset = styled(Fieldset)`
    margin: 0 1rem 2rem 0;
`;

const StyledSwitch = styled(Checkbox)`
    align-self: end;
`;

interface IBarnehagebarnFilterSkjemaProps {
    oppdaterFiltrering: (filter: IBarnehagebarnFilter) => void;
    barnehageKommuner: () => IBarnehagekommune[];
    barnehagebarnRequestParams: IBarnehagebarnRequestParams;
}

const BarnehagebarnFilterskjema: React.FunctionComponent<IBarnehagebarnFilterSkjemaProps> = (
    props: IBarnehagebarnFilterSkjemaProps
) => {
    const { oppdaterFiltrering, barnehageKommuner } = props;

    const { register, handleSubmit, reset, control, watch, setValue } =
        useForm<IBarnehagebarnFilter>();

    const onSubmit: SubmitHandler<IBarnehagebarnFilter> = barnehagebarnFilter => {
        oppdaterFiltrering(barnehagebarnFilter);
    };

    const ident = watch('ident');

    if (ident && ident.length > 0) {
        setValue('kommuneNavn', undefined);
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <StyledFieldset
                size="small"
                aria-label="Barnehagebarn filterskjema"
                legend="Filterskjema"
                description="Filtrer barnehagebarn resultater"
                hideLegend
            >
                <VStack gap="4">
                    <HStack gap="4" align="center">
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
                        <StyledSwitch
                            id="kun-loepende-andel"
                            title="Vis kun løpende andeler"
                            size="medium"
                            {...register('kunLøpendeAndel')}
                        >
                            Kun løpende utbetalinger
                        </StyledSwitch>
                    </HStack>
                    <HStack gap="4">
                        <Button
                            type="submit"
                            variant="primary"
                            size="medium"
                            icon={<FunnelIcon aria-hidden />}
                        >
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
            </StyledFieldset>
        </form>
    );
};

export default BarnehagebarnFilterskjema;
