import { KlageMottattDatoFelt } from '@komponenter/Saklinje/Meny/OpprettBehandling/KlageMottattDatoFelt';
import { SøknadMottattDatoFelt } from '@komponenter/Saklinje/Meny/OpprettBehandling/SøknadMottattDatoFelt';
import { useOpprettBehandlingSkjema } from '@komponenter/Saklinje/Meny/OpprettBehandling/useOpprettBehandlingSkjema';
import { FormProvider } from 'react-hook-form';

import { Button, Fieldset, Modal, VStack } from '@navikt/ds-react';

import { BehandlingstypeFelt } from './BehandlingstypeFelt';
import { BehandlingsårsakFelt } from './BehandlingsårsakFelt';
import { OpprettBehandlingBehandlingstemaSelect } from './OpprettBehandlingBehandlingstemaSelect';

interface Props {
    lukkModal: () => void;
    onTilbakekrevingsbehandlingOpprettet: () => void;
}

export function OpprettBehandlingModal({ lukkModal, onTilbakekrevingsbehandlingOpprettet }: Props) {
    const { form, onSubmit } = useOpprettBehandlingSkjema({
        lukkModal,
        onTilbakekrevingsbehandlingOpprettet,
    });

    const {
        handleSubmit,
        formState: { isSubmitting, errors },
    } = form;

    return (
        <Modal
            open={true}
            portal={true}
            width={'35rem'}
            header={{ heading: 'Opprett ny behandling' }}
            onClose={lukkModal}
        >
            <FormProvider {...form}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <Fieldset error={errors.root?.message} legend={'Opprett ny behandling'} hideLegend>
                            <VStack gap={'space-16'}>
                                {/* Vises alltid */}
                                <BehandlingstypeFelt />
                                {/* TODO: Vises ved Behandlingstype.REVURDERING */}
                                <BehandlingsårsakFelt />
                                {/* Vises ved Behandlingstype in Behandlingstype && Behandlingårsak.SØKNAD */}
                                <OpprettBehandlingBehandlingstemaSelect />
                                {/* Vises ved Klagebehandlingstype.KLAGE */}
                                <KlageMottattDatoFelt />
                                {/* Vises ved Behandlingstype.FØRSTEGANGSBEHANDLING eller ved Behandlingstype.REVURDERING && Behandlingsårsak.SØKNAD */}
                                <SøknadMottattDatoFelt />
                            </VStack>
                        </Fieldset>
                    </Modal.Body>
                </form>
            </FormProvider>
            <Modal.Footer>
                <Button type={'submit'} variant="primary" size="small" loading={isSubmitting}>
                    Bekreft
                </Button>
                <Button variant="tertiary" size="small" onClick={lukkModal}>
                    Avbryt
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
