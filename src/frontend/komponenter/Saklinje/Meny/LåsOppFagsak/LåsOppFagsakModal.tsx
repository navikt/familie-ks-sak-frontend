import { ModalType } from '@context/ModalContext';
import { mutationKeys } from '@hooks/keys/mutationKeys';
import { useFagsak } from '@hooks/useFagsak';
import { useModal } from '@hooks/useModal';
import { InformationSquareIcon } from '@navikt/aksel-icons';
import { Button, Dialog, Fieldset, InfoCard, Textarea, VStack } from '@navikt/ds-react';
import { useIsMutating } from '@tanstack/react-query';
import { FormProvider, useController, useFormContext } from 'react-hook-form';

import {
    LÅS_OPP_FAGSAK_FORM_ID,
    LåsOppFagsakFormFields,
    type LåsOppFagsakFormValues,
    useLåsOppFagsakForm,
} from './useLåsOppFagsakForm';

export function LåsOppFagsakModal() {
    const fagsak = useFagsak();
    const { erModalÅpen, tittel, lukkModal, bredde } = useModal(ModalType.LÅS_OPP_FAGSAK);

    const antallPågåendeOpplåsinger = useIsMutating({
        mutationKey: mutationKeys.låsOppFagsak(fagsak.id),
    });

    return (
        <Dialog
            open={erModalÅpen}
            onOpenChange={åpen => {
                if (!åpen && antallPågåendeOpplåsinger === 0) {
                    lukkModal();
                }
            }}
            size={'medium'}
        >
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
    const { lukkModal } = useModal(ModalType.LÅS_OPP_FAGSAK);
    const { form, onSubmit } = useLåsOppFagsakForm();

    const {
        handleSubmit,
        formState: { isSubmitting, errors },
    } = form;
    return (
        <>
            <Dialog.Body>
                <VStack gap={'space-16'}>
                    <InfoCard data-color="info">
                        <InfoCard.Message icon={<InformationSquareIcon aria-hidden />}>
                            Skriv en begrunnelse som forklarer hvorfor fagsaken låses opp. Merk at fagsaken vil låses
                            ned igjen etter en periode dersom det ikke opprettes en ny behandling.
                        </InfoCard.Message>
                    </InfoCard>
                    <FormProvider {...form}>
                        <form id={LÅS_OPP_FAGSAK_FORM_ID} onSubmit={handleSubmit(onSubmit)}>
                            <Fieldset legend={'Lås opp fagsak'} hideLegend={true} error={errors?.root?.message}>
                                <BegrunnelseFelt />
                            </Fieldset>
                        </form>
                    </FormProvider>
                </VStack>
            </Dialog.Body>
            <Dialog.Footer>
                <Button
                    form={LÅS_OPP_FAGSAK_FORM_ID}
                    variant={'primary'}
                    size={'small'}
                    type={'submit'}
                    loading={isSubmitting}
                >
                    Bekreft
                </Button>
                <Button variant={'tertiary'} size={'small'} onClick={() => lukkModal()} disabled={isSubmitting}>
                    Avbryt
                </Button>
            </Dialog.Footer>
        </>
    );
}

function BegrunnelseFelt() {
    const { control } = useFormContext<LåsOppFagsakFormValues>();

    const {
        field: { name, ref, value, onBlur, onChange },
        fieldState: { error },
        formState: { isSubmitting },
    } = useController({
        name: LåsOppFagsakFormFields.BEGRUNNELSE,
        control,
        rules: {
            validate: verdi => {
                const trimmed = verdi.trim();
                if (trimmed.length < 5) {
                    return 'Skriv en begrunnelse med minst 5 tegn.';
                }
                if (trimmed.length > 4000) {
                    return 'Begrunnelsen kan ikke være lengre enn 4000 tegn.';
                }
            },
        },
    });

    return (
        <Textarea
            ref={ref}
            id={name}
            name={name}
            label={'Begrunnelse'}
            maxLength={4000}
            value={value}
            onBlur={onBlur}
            onChange={onChange}
            error={error?.message}
            readOnly={isSubmitting}
        />
    );
}
