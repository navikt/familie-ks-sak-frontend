import { InformationSquareIcon } from '@navikt/aksel-icons';
import { Button, Dialog, Fieldset, InfoCard, VStack } from '@navikt/ds-react';
import { FormProvider } from 'react-hook-form';
import { ModalType } from '../../../../context/ModalContext';
import { useModal } from '../../../../hooks/useModal';
import { HenleggÅrsak } from '../../../../typer/behandling';
import { BegrunnelseFelt } from './BegrunnelseFelt';
import { ForhåndsvisBrevLenke } from './ForhåndsvisBrevLenke';
import {
    HENLEGG_BEHANDLING_FORM_ID,
    HenleggBehandlingFormFields,
    HenleggBehandlingServerErrors,
    useHenleggBehandlingForm,
} from './useHenleggBehandlingForm';
import { ÅrsakFelt } from './ÅrsakFelt';

export function HenleggBehandlingModal() {
    const { erModalÅpen, tittel, lukkModal, bredde } = useModal(ModalType.HENLEGG_BEHANDLING);
    return (
        <Dialog open={erModalÅpen} onOpenChange={åpen => !åpen && lukkModal()} size={'medium'}>
            <Dialog.Popup width={bredde} closeOnOutsideClick={false}>
                <Dialog.Header>
                    <Dialog.Title>{tittel}</Dialog.Title>
                </Dialog.Header>
                {erModalÅpen && <Innhold />}
            </Dialog.Popup>
        </Dialog>
    );
}

function Innhold() {
    const { lukkModal } = useModal(ModalType.HENLEGG_BEHANDLING);

    const { form, onSubmit } = useHenleggBehandlingForm();

    const {
        watch,
        handleSubmit,
        formState: { errors },
    } = form;

    const valgtÅrsak = watch(HenleggBehandlingFormFields.ÅRSAK);

    const submitError = HenleggBehandlingServerErrors.onSubmitError.lookup(errors);

    return (
        <>
            <Dialog.Body>
                <VStack gap={'space-16'}>
                    <InfoCard data-color="info">
                        <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
                            <InfoCard.Title>
                                Skriv en begrunnelse som forklarer hvorfor behandlingen henlegges.
                            </InfoCard.Title>
                        </InfoCard.Header>
                        <InfoCard.Content>
                            Dette kan gi andre saksbehandlere bedre grunnlag hvis de gjenopptar saken, og kan gjøre det
                            lettere for teamet å feilsøke.
                        </InfoCard.Content>
                    </InfoCard>
                    <FormProvider {...form}>
                        <form id={HENLEGG_BEHANDLING_FORM_ID} onSubmit={handleSubmit(onSubmit)}>
                            <Fieldset legend={'Henlegg behandling'} hideLegend={true} error={submitError}>
                                <VStack gap={'space-16'}>
                                    <ÅrsakFelt />
                                    <BegrunnelseFelt />
                                </VStack>
                            </Fieldset>
                        </form>
                    </FormProvider>
                </VStack>
            </Dialog.Body>
            <Dialog.Footer>
                <Button
                    form={HENLEGG_BEHANDLING_FORM_ID}
                    variant={'primary'}
                    size={'small'}
                    type={'submit'}
                    loading={form.formState.isSubmitting}
                    disabled={form.formState.isSubmitting}
                >
                    {valgtÅrsak === HenleggÅrsak.SØKNAD_TRUKKET ? 'Bekreft og send brev' : 'Bekreft'}
                </Button>
                <Button variant={'tertiary'} size={'small'} onClick={() => lukkModal()}>
                    Avbryt
                </Button>
                {valgtÅrsak === HenleggÅrsak.SØKNAD_TRUKKET && <ForhåndsvisBrevLenke />}
            </Dialog.Footer>
        </>
    );
}
