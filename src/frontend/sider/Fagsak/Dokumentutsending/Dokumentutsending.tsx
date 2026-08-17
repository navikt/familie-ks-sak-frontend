import { useState } from 'react';

import { Fagsaklinje } from '@komponenter/Saklinje/Fagsaklinje';

import { HGrid } from '@navikt/ds-react';

import { BrevSendtDialog } from './BrevSendtDialog';
import { DokumentutsendingSkjema } from './DokumentutsendingSkjema';

export function Dokumentutsending() {
    const [erBrevSendtDialogÅpen, settErBrevSendtDialogÅpen] = useState(false);
    const [forhåndsvisningUrl, settForhåndsvisningUrl] = useState<string>();

    return (
        <>
            <Fagsaklinje />
            <HGrid columns={'35rem 1fr'} height={'calc(100vh - 6rem)'}>
                <BrevSendtDialog
                    erBrevSendtDialogÅpen={erBrevSendtDialogÅpen}
                    settErBrevSendtDialogÅpen={settErBrevSendtDialogÅpen}
                />
                <DokumentutsendingSkjema
                    åpneBrevSendtDialog={() => settErBrevSendtDialogÅpen(true)}
                    settForhåndsvisningUrl={settForhåndsvisningUrl}
                />

                <iframe title={'dokument'} src={forhåndsvisningUrl} width={'100%'} height={'100%'} />
            </HGrid>
        </>
    );
}
