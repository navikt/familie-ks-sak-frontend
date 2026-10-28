import { useFeatureToggles } from '@hooks/useFeatureToggles';
import { BrevmottakerDialogFagsak } from '@komponenter/Brevmottaker/Fagsak/BrevmottakerDialogFagsak';
import { useBrevmottakerDialogContext } from '@komponenter/Brevmottaker/Felles/BrevmottakerDialogContext';
import { ChevronDownIcon } from '@navikt/aksel-icons';
import { ActionMenu, Button } from '@navikt/ds-react';
import { FeatureToggle } from '@typer/featureToggles';
import { useState } from 'react';
import { LeggTilEllerFjernBrevmottakerPåFagsak } from './Brevmottaker/LeggTilEllerFjernBrevmottakerPåFagsak';

import Styles from './Fagsakmeny.module.css';
import { LeggTilBrevmottakerModalFagsak } from './LeggTilEllerFjernBrevmottakere/LeggTilBrevmottakerModalFagsak';
import { LeggTilEllerFjernBrevmottakerePåFagsak } from './LeggTilEllerFjernBrevmottakere/LeggTilEllerFjernBrevmottakerePåFagsak';
import { LåsOppFagsak } from './LåsOppFagsak/LåsOppFagsak';
import { LåsOppFagsakModal } from './LåsOppFagsak/LåsOppFagsakModal';
import { OpprettBehandling } from './OpprettBehandling/OpprettBehandling';
import { OpprettBehandlingModal } from './OpprettBehandling/OpprettBehandlingModal';
import { TilbakekrevingsbehandlingOpprettetModal } from './OpprettBehandling/TilbakekrevingsbehandlingOpprettetModal';
import { SendInformasjonsbrev } from './SendInformasjonsbrev/SendInformasjonsbrev';

export function Fagsakmeny() {
    const toggles = useFeatureToggles();

    const [visOpprettBehandlingModal, settVisOpprettBehandlingModal] = useState(false);
    const [visTilbakekrevingsbehandlingOpprettetModal, settVisTilbakekrevingsbehandlingOpprettetModal] =
        useState(false);

    const {
        erDialogÅpen: erBrevmottakerDialogÅpen,
        åpneDialog: åpneBrevmottakerDialog,
        lukkDialog: lukkBrevmottakerDialog,
    } = useBrevmottakerDialogContext();

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
            {erBrevmottakerDialogÅpen &&
                (toggles[FeatureToggle.brukNyttBrevmottakerSkjema] ? (
                    <BrevmottakerDialogFagsak />
                ) : (
                    <LeggTilBrevmottakerModalFagsak lukkModal={lukkBrevmottakerDialog} />
                ))}
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
                        {toggles[FeatureToggle.brukNyttBrevmottakerSkjema] ? (
                            <LeggTilEllerFjernBrevmottakerPåFagsak />
                        ) : (
                            <LeggTilEllerFjernBrevmottakerePåFagsak åpneModal={åpneBrevmottakerDialog} />
                        )}
                        <SendInformasjonsbrev />
                        <LåsOppFagsak />
                    </ActionMenu.Group>
                </ActionMenu.Content>
            </ActionMenu>
        </>
    );
}
