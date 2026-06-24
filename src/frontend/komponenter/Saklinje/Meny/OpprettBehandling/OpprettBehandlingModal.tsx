import { KlageMottattDatoFelt } from '@komponenter/Saklinje/Meny/OpprettBehandling/KlageMottattDatoFelt';
import { SøknadMottattDatoFelt } from '@komponenter/Saklinje/Meny/OpprettBehandling/SøknadMottattDatoFelt';
import {
    OpprettBehandlingFelt,
    useOpprettBehandlingSkjema,
} from '@komponenter/Saklinje/Meny/OpprettBehandling/useOpprettBehandlingSkjema';
import { Behandlingstype, BehandlingÅrsak } from '@typer/behandling';
import { Klagebehandlingstype } from '@typer/klage';
import { FormProvider } from 'react-hook-form';

import { Button, Fieldset, Modal, VStack } from '@navikt/ds-react';

import { BehandlingstemaSelect } from './BehandlingstemaSelect';
import { BehandlingstypeFelt } from './BehandlingstypeFelt';
import { BehandlingsårsakFelt } from './BehandlingsårsakFelt';

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
        watch,
    } = form;

    console.log('form values: ', form.getValues());
    const behandlingstype = watch(OpprettBehandlingFelt.BEHANDLINGSTYPE);
    const behandlingsårsak = watch(OpprettBehandlingFelt.BEHANDLINGSÅRSAK);

    const skalViseBehandlingsårsakFelt = behandlingstype === Behandlingstype.REVURDERING;
    const skalViseBehandlingstemaSelect =
        behandlingstype in Behandlingstype && behandlingsårsak === BehandlingÅrsak.SØKNAD;
    const skalViseKlageMottattDatoFelt = behandlingstype === Klagebehandlingstype.KLAGE;
    const skalViseSøknadMottattDatoFelt =
        behandlingstype === Behandlingstype.FØRSTEGANGSBEHANDLING ||
        (behandlingstype === Behandlingstype.REVURDERING && behandlingsårsak === BehandlingÅrsak.SØKNAD);

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
                                <BehandlingstypeFelt />
                                {skalViseBehandlingsårsakFelt && <BehandlingsårsakFelt />}
                                {skalViseBehandlingstemaSelect && <BehandlingstemaSelect />}
                                {skalViseKlageMottattDatoFelt && <KlageMottattDatoFelt />}
                                {skalViseSøknadMottattDatoFelt && <SøknadMottattDatoFelt />}
                            </VStack>
                        </Fieldset>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button type={'submit'} variant="primary" size="small" loading={isSubmitting}>
                            Bekreft
                        </Button>
                        <Button
                            type={'button'}
                            variant="tertiary"
                            size="small"
                            disabled={isSubmitting}
                            onClick={lukkModal}
                        >
                            Avbryt
                        </Button>
                    </Modal.Footer>
                </form>
            </FormProvider>
        </Modal>
    );
}
