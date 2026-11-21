import { useErLesevisning } from '@hooks/useErLesevisning';
import { LeggTilBarnFelt } from '@komponenter/Saklinje/Meny/LeggTilBarnPåBehandling/LeggTilBarnFelt';
import { useLeggTilBarnPåBehandlingSkjema } from '@komponenter/Saklinje/Meny/LeggTilBarnPåBehandling/useLeggTilBarnPåBehandlingSkjema';
import { InformationSquareIcon } from '@navikt/aksel-icons';
import { Button, Dialog, Fieldset, HelpText, HStack, InfoCard } from '@navikt/ds-react';
import { FormProvider } from 'react-hook-form';

const FORM_ID = 'legg-til-barn-pa-behandling-form';

interface Props {
    lukkModal: () => void;
}

export function LeggTiLBarnPåBehandlingModal({ lukkModal }: Props) {
    const erLesevisning = useErLesevisning();

    const { form, onSubmit } = useLeggTilBarnPåBehandlingSkjema({ lukkModal });

    const {
        handleSubmit,
        formState: { isSubmitting, errors },
    } = form;

    return (
        <Dialog open onOpenChange={åpen => !åpen && lukkModal()}>
            <Dialog.Popup width={'35rem'} closeOnOutsideClick={false}>
                <Dialog.Header>
                    <HStack gap={'space-8'}>
                        <Dialog.Title>Legg til barn</Dialog.Title>
                        <HelpText strategy={'fixed'} placement={'top'}>
                            Her kan du, ved klage eller ettersendt dokumentasjon, legge til barn som ikke lenger ligger
                            på behandlingen fordi vi tidligere har avslått eller opphørt.
                        </HelpText>
                    </HStack>
                </Dialog.Header>
                <Dialog.Body>
                    <FormProvider {...form}>
                        <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)}>
                            <Fieldset
                                error={errors.root?.message}
                                errorPropagation={false}
                                legend="Legg til barn på behandling"
                                hideLegend
                            >
                                <InfoCard data-color={'info'}>
                                    <InfoCard.Message icon={<InformationSquareIcon aria-hidden />}>
                                        Du er i ferd med å legge til et barn på behandlingen. Handlingen kan ikke
                                        reverseres uten å henlegge.
                                    </InfoCard.Message>
                                </InfoCard>
                                <LeggTilBarnFelt erLesevisning={erLesevisning} />
                            </Fieldset>
                        </form>
                    </FormProvider>
                </Dialog.Body>
                <Dialog.Footer>
                    <Button
                        form={FORM_ID}
                        type={'submit'}
                        variant="primary"
                        size="small"
                        loading={isSubmitting}
                        disabled={erLesevisning}
                    >
                        Legg til
                    </Button>
                    <Button variant="tertiary" size="small" onClick={lukkModal}>
                        Avbryt
                    </Button>
                </Dialog.Footer>
            </Dialog.Popup>
        </Dialog>
    );
}
