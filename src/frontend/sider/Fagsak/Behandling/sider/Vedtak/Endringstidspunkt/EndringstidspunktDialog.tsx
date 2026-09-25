import { useBehandling } from '@hooks/useBehandling';
import { useErLesevisning } from '@hooks/useErLesevisning';
import { Datoformat, isoStringTilFormatertString } from '@utils/dato';
import { FormProvider } from 'react-hook-form';

import { BodyShort, Button, Dialog, Fieldset, InlineMessage, Label, VStack } from '@navikt/ds-react';

import { useEndringstidspunktDialogContext } from './EndringstidspunktDialogContext';
import { EndringstidspunktField } from './EndringstidspunktField';
import { useEndringstidspunktForm } from './useEndringstidspunktForm';

function formaterDato(endringstidspunkt: string) {
    return isoStringTilFormatertString({ isoString: endringstidspunkt, tilFormat: Datoformat.DATO });
}

export function EndringstidspunktDialog() {
    const behandling = useBehandling();
    const erLesevisning = useErLesevisning();

    const { erDialogÅpen, lukkDialog } = useEndringstidspunktDialogContext();

    const { form, onSubmit } = useEndringstidspunktForm();

    const {
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = form;

    const endringstidspunkt = behandling.endringstidspunkt;

    function onLukkDialog() {
        lukkDialog();
        reset();
    }

    return (
        <Dialog open={erDialogÅpen} onOpenChange={onLukkDialog}>
            <Dialog.Popup width={'35rem'}>
                <Dialog.Header>
                    <Dialog.Title>Oppdater endringstidspunkt</Dialog.Title>
                </Dialog.Header>
                <FormProvider {...form}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Dialog.Body>
                            <VStack gap={'space-24'}>
                                <InlineMessage status={'info'}>
                                    Dersom du ønsker å vise perioder som er filtrert bort i vedtaksbildet, kan du
                                    oppdatere endringstidspunktet tilbake i tid.
                                </InlineMessage>
                                <VStack gap={'space-4'}>
                                    <Label>Endringstidspunkt</Label>
                                    {endringstidspunkt && <BodyShort>{formaterDato(endringstidspunkt)}</BodyShort>}
                                    {!endringstidspunkt && <BodyShort>Ingen endringstidspunkt</BodyShort>}
                                </VStack>
                                <Fieldset
                                    error={errors.root?.message}
                                    legend={'Oppdater endringstidspunkt'}
                                    hideLegend={true}
                                    errorPropagation={false}
                                >
                                    <EndringstidspunktField />
                                </Fieldset>
                            </VStack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            {!erLesevisning && (
                                <Button type={'submit'} variant={'primary'} loading={isSubmitting}>
                                    Oppdater
                                </Button>
                            )}
                            <Button type={'button'} variant={'tertiary'} onClick={onLukkDialog} disabled={isSubmitting}>
                                Avbryt
                            </Button>
                        </Dialog.Footer>
                    </form>
                </FormProvider>
            </Dialog.Popup>
        </Dialog>
    );
}
