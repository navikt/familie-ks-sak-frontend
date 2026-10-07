import { useErLesevisning } from '@hooks/useErLesevisning';
import { useSlettEndretUtbetalingAndelIsPending } from '@hooks/useSlettEndretUtbetalingAndelIsPending';
import { Alert, Box, Fieldset, HStack, VStack } from '@navikt/ds-react';
import { IEndretUtbetalingAndelÅrsak } from '@typer/utbetalingAndel';
import { FormProvider, type UseFormReturn } from 'react-hook-form';

import { useEndretUtbetalingAndelContext } from '../EndretUtbetalingAndelContext';
import {
    EndretUtbetalingAndelFeltnavn,
    type EndretUtbetalingAndelFormValues,
} from './endretUtbetalingAndelSkjemaTyper';
import { AvslagBegrunnelsevelger } from './felter/AvslagBegrunnelsevelger';
import { Begrunnelse } from './felter/Begrunnelse';
import { EksplisittAvslagCheckbox } from './felter/EksplisittAvslagCheckbox';
import { FomMåned } from './felter/FomMåned';
import { Personvelger } from './felter/Personvelger';
import { SkjemaKnapper } from './felter/SkjemaKnapper';
import { Søknadstidspunkt } from './felter/Søknadstidspunkt';
import { TomMåned } from './felter/TomMåned';
import { Utbetalingvelger } from './felter/Utbetalingvelger';
import { Årsakvelger } from './felter/Årsakvelger';

interface Props {
    form: UseFormReturn<EndretUtbetalingAndelFormValues>;
    onSubmit: (values: EndretUtbetalingAndelFormValues) => Promise<void>;
    lukkSkjema: () => void;
}

export function EndretUtbetalingAndelSkjema({ form, onSubmit, lukkSkjema }: Props) {
    const erLesevisning = useErLesevisning();
    const { endretUtbetalingAndel } = useEndretUtbetalingAndelContext();
    const sletter = useSlettEndretUtbetalingAndelIsPending(endretUtbetalingAndel.id);

    const {
        handleSubmit,
        watch,
        clearErrors,
        formState: { errors, isSubmitting },
    } = form;

    const låsFelter = erLesevisning || isSubmitting || sletter;

    const årsak = watch(EndretUtbetalingAndelFeltnavn.ÅRSAK);
    const periodeSkalUtbetales = watch(EndretUtbetalingAndelFeltnavn.PERIODE_SKAL_UTBETALES);
    const erEksplisittAvslag = watch(EndretUtbetalingAndelFeltnavn.ER_EKSPLISITT_AVSLAG);

    const erAlleredeUtbetalt = årsak === IEndretUtbetalingAndelÅrsak.ALLEREDE_UTBETALT;
    const skalViseEksplisittAvslag = erLesevisning
        ? erEksplisittAvslag
        : erAlleredeUtbetalt || periodeSkalUtbetales !== true;

    return (
        <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Box
                    borderWidth={'0 0 0 1'}
                    borderColor={'accent'}
                    paddingInline={'space-32'}
                    marginBlock={'space-16 space-24'}
                >
                    <Fieldset legend={'Skjema for å endre utbetalingsandel'} hideLegend>
                        <VStack gap={'space-16'} maxWidth={'30rem'}>
                            <Personvelger erLesevisning={låsFelter} />

                            <HStack gap={'space-16'}>
                                <FomMåned erLesevisning={låsFelter} />
                                <TomMåned erLesevisning={låsFelter} />
                            </HStack>

                            <Årsakvelger erLesevisning={låsFelter} />

                            <Utbetalingvelger erLesevisning={låsFelter} />

                            {skalViseEksplisittAvslag && <EksplisittAvslagCheckbox erLesevisning={låsFelter} />}

                            {erAlleredeUtbetalt && erEksplisittAvslag && (
                                <AvslagBegrunnelsevelger erLesevisning={låsFelter} />
                            )}

                            <Søknadstidspunkt erLesevisning={låsFelter} />

                            <Begrunnelse erLesevisning={låsFelter} />

                            {!erLesevisning && <SkjemaKnapper lukkSkjema={lukkSkjema} />}

                            {errors.root?.message && (
                                <Alert variant={'error'} size={'small'} closeButton onClose={() => clearErrors('root')}>
                                    {errors.root.message}
                                </Alert>
                            )}
                        </VStack>
                    </Fieldset>
                </Box>
            </form>
        </FormProvider>
    );
}
