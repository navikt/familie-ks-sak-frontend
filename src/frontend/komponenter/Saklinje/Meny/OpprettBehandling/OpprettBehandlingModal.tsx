import { BehandlingskategoriFelt } from '@komponenter/Saklinje/Meny/OpprettBehandling/felter/BehandlingskategoriFelt';
import { KlageMottattDatoFelt } from '@komponenter/Saklinje/Meny/OpprettBehandling/felter/KlageMottattDatoFelt';
import { SøknadMottattDatoFelt } from '@komponenter/Saklinje/Meny/OpprettBehandling/felter/SøknadMottattDatoFelt';
import {
    OpprettBehandlingFelt,
    useOpprettBehandlingSkjema,
} from '@komponenter/Saklinje/Meny/OpprettBehandling/useOpprettBehandlingSkjema';
import { Button, Dialog, Fieldset, VStack } from '@navikt/ds-react';
import { Behandlingstype, BehandlingÅrsak } from '@typer/behandling';
import { Klagebehandlingstype } from '@typer/klage';
import { FormProvider } from 'react-hook-form';

import { BehandlingstypeFelt } from './felter/BehandlingstypeFelt';
import { BehandlingsårsakFelt } from './felter/BehandlingsårsakFelt';

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

    const behandlingstype = watch(OpprettBehandlingFelt.BEHANDLINGSTYPE);
    const behandlingsårsak = watch(OpprettBehandlingFelt.BEHANDLINGSÅRSAK);

    const skalViseBehandlingsårsakFelt = behandlingstype === Behandlingstype.REVURDERING;
    const skalViseBehandlingskategoriFelt =
        behandlingstype in Behandlingstype && behandlingsårsak === BehandlingÅrsak.SØKNAD;
    const skalViseKlageMottattDatoFelt = behandlingstype === Klagebehandlingstype.KLAGE;
    const skalViseSøknadMottattDatoFelt =
        behandlingstype === Behandlingstype.FØRSTEGANGSBEHANDLING ||
        (behandlingstype === Behandlingstype.REVURDERING && behandlingsårsak === BehandlingÅrsak.SØKNAD);

    return (
        <Dialog open={true} onOpenChange={åpen => !åpen && lukkModal()}>
            <Dialog.Popup width={'35rem'} closeOnOutsideClick={false}>
                <Dialog.Header>
                    <Dialog.Title>Opprett ny behandling</Dialog.Title>
                </Dialog.Header>
                <FormProvider {...form}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Dialog.Body>
                            <Fieldset error={errors.root?.message} legend={'Opprett ny behandling'} hideLegend>
                                <VStack gap={'space-16'}>
                                    <BehandlingstypeFelt />
                                    {skalViseBehandlingsårsakFelt && <BehandlingsårsakFelt />}
                                    {skalViseBehandlingskategoriFelt && <BehandlingskategoriFelt />}
                                    {skalViseKlageMottattDatoFelt && <KlageMottattDatoFelt />}
                                    {skalViseSøknadMottattDatoFelt && <SøknadMottattDatoFelt />}
                                </VStack>
                            </Fieldset>
                        </Dialog.Body>
                        <Dialog.Footer>
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
                        </Dialog.Footer>
                    </form>
                </FormProvider>
            </Dialog.Popup>
        </Dialog>
    );
}
