import { useId } from 'react';

import { FormProvider } from 'react-hook-form';

import { BodyShort, Button, Fieldset, InlineMessage, Label, Modal, VStack } from '@navikt/ds-react';

import { EndringstidspunktFelt } from './EndringstidspunktFelt';
import { useEndringstidspunktForm } from './useEndringstidspunktForm';
import { Datoformat, isoStringTilFormatertString } from '../../../../../../utils/dato';
import { useBehandlingContext } from '../../../context/BehandlingContext';

function formaterDato(endringstidspunkt: string) {
    return isoStringTilFormatertString({ isoString: endringstidspunkt, tilFormat: Datoformat.DATO });
}

interface Props {
    lukkModal: () => void;
}

export function OppdaterEndringstidspunktModal({ lukkModal }: Props) {
    const { behandling, vurderErLesevisning } = useBehandlingContext();
    const hentetEndringstidspunktId = useId();

    const { form, onSubmit } = useEndringstidspunktForm({ lukkModal });

    const {
        handleSubmit,
        formState: { errors, isSubmitting },
    } = form;

    const erLesevisning = vurderErLesevisning();
    const endringstidspunkt = behandling.endringstidspunkt;

    return (
        <Modal
            open={true}
            onClose={lukkModal}
            width={'35rem'}
            header={{ heading: 'Oppdater endringstidspunkt', size: 'medium' }}
            portal={true}
        >
            <FormProvider {...form}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <VStack gap={'space-24'}>
                            <InlineMessage status={'info'}>
                                Dersom du ønsker å vise perioder som er filtrert bort i vedtaksbildet, kan du oppdatere
                                endringstidspunktet tilbake i tid.
                            </InlineMessage>
                            <VStack gap={'space-4'}>
                                <Label htmlFor={hentetEndringstidspunktId}>Endringstidspunkt</Label>
                                {endringstidspunkt && <BodyShort>{formaterDato(endringstidspunkt)}</BodyShort>}
                                {!endringstidspunkt && <BodyShort>Ingen endringstidspunkt</BodyShort>}
                            </VStack>
                            <Fieldset
                                error={errors.root?.message}
                                legend={'Oppdater endringstidspunkt'}
                                hideLegend={true}
                            >
                                <EndringstidspunktFelt readOnly={isSubmitting || erLesevisning} />
                            </Fieldset>
                        </VStack>
                    </Modal.Body>
                    <Modal.Footer>
                        {!erLesevisning && (
                            <>
                                <Button type={'submit'} variant={'primary'} loading={isSubmitting}>
                                    Oppdater
                                </Button>
                                <Button variant={'tertiary'} onClick={lukkModal} disabled={isSubmitting}>
                                    Avbryt
                                </Button>
                            </>
                        )}
                        {erLesevisning && (
                            <Button variant={'primary'} onClick={lukkModal}>
                                Lukk
                            </Button>
                        )}
                    </Modal.Footer>
                </form>
            </FormProvider>
        </Modal>
    );
}
