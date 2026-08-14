import { ModalType } from '@context/ModalContext';
import { useFagsak } from '@hooks/useFagsak';
import { LåsOppFagsakMutationKeyFactory } from '@hooks/useLåsOppFagsak';
import { useModal } from '@hooks/useModal';
import { useIsMutating } from '@tanstack/react-query';
import { FormProvider, useController, useFormContext } from 'react-hook-form';

import { InformationSquareIcon } from '@navikt/aksel-icons';
import { Button, Fieldset, InfoCard, Modal, Textarea, VStack } from '@navikt/ds-react';

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
        mutationKey: LåsOppFagsakMutationKeyFactory.låsOppFagsak(fagsak.id),
    });

    return (
        <Modal
            open={erModalÅpen}
            width={bredde}
            onClose={lukkModal}
            // Hindrer at Escape og lukkeknappen avmonterer skjemaet mens opplåsingen er underveis.
            onBeforeClose={() => antallPågåendeOpplåsinger === 0}
            header={{ heading: tittel, size: 'medium' }}
            portal={true}
        >
            {erModalÅpen && <Innhold />}
        </Modal>
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
            <Modal.Body>
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
            </Modal.Body>
            <Modal.Footer>
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
            </Modal.Footer>
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
