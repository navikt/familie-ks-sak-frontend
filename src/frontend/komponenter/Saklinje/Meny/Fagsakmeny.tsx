import { BrevmottakerDialogFagsak } from '@komponenter/Brevmottaker/Fagsak/BrevmottakerDialogFagsak';
import { useBrevmottakerDialogContext } from '@komponenter/Brevmottaker/Felles/BrevmottakerDialogContext';
import { ChevronDownIcon } from '@navikt/aksel-icons';
import { ActionMenu, Button } from '@navikt/ds-react';
import { useState } from 'react';
import { LeggTilEllerFjernBrevmottakerPåFagsak } from './Brevmottaker/LeggTilEllerFjernBrevmottakerPåFagsak';

import Styles from './Fagsakmeny.module.css';
import { LåsOppFagsak } from './LåsOppFagsak/LåsOppFagsak';
import { LåsOppFagsakModal } from './LåsOppFagsak/LåsOppFagsakModal';
import { OpprettBehandling } from './OpprettBehandling/OpprettBehandling';
import { OpprettBehandlingModal } from './OpprettBehandling/OpprettBehandlingModal';
import { TilbakekrevingsbehandlingOpprettetModal } from './OpprettBehandling/TilbakekrevingsbehandlingOpprettetModal';
import { SendInformasjonsbrev } from './SendInformasjonsbrev/SendInformasjonsbrev';

export function Fagsakmeny() {
    const [visOpprettBehandlingModal, settVisOpprettBehandlingModal] = useState(false);
    const [visTilbakekrevingsbehandlingOpprettetModal, settVisTilbakekrevingsbehandlingOpprettetModal] =
        useState(false);

    const { erDialogÅpen: erBrevmottakerDialogÅpen } = useBrevmottakerDialogContext();

    return (
        <>
            {visOpprettBehandlingModal && (
                <OpprettBehandlingModal
                    lukkModal={() => settVisOpprettBehandlingModal(false)}
                    onTilbakekrevingsbehandlingOpprettet={() => settVisTilbakekrevingsbehandlingOpprettetModal(true)}
                />
            )}
            {visTilbakekrevingsbehandlingOpprettetModal && (
                <TilbakekrevingsbehandlingOpprettetModal
                    lukkModal={() => settVisTilbakekrevingsbehandlingOpprettetModal(false)}
                />
            )}
            {erBrevmottakerDialogÅpen && <BrevmottakerDialogFagsak />}
            <LåsOppFagsakModal />
            <ActionMenu>
                <ActionMenu.Trigger>
                    <Button variant={'secondary'} size={'small'} iconPosition={'right'} icon={<ChevronDownIcon />}>
                        Meny
                    </Button>
                </ActionMenu.Trigger>
                <ActionMenu.Content>
                    <ActionMenu.Group className={Styles.group} aria-label={'Fagsak'}>
                        <OpprettBehandling åpneModal={() => settVisOpprettBehandlingModal(true)} />
                        <LeggTilEllerFjernBrevmottakerPåFagsak />
                        <SendInformasjonsbrev />
                        <LåsOppFagsak />
                    </ActionMenu.Group>
                </ActionMenu.Content>
            </ActionMenu>
        </>
    );
}
