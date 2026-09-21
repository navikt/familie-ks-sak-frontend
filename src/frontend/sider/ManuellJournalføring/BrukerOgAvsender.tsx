import { AvsenderPanel } from '@sider/ManuellJournalføring/AvsenderPanel';
import { BrukerPanel } from '@sider/ManuellJournalføring/BrukerPanel';

import { Heading, VStack } from '@navikt/ds-react';

export function BrukerOgAvsender() {
    return (
        <VStack marginBlock={'space-40 space-0'} gap={'space-16'}>
            <Heading size={'small'} level={'2'}>
                Bruker og avsender
            </Heading>
            <BrukerPanel />
            <AvsenderPanel />
        </VStack>
    );
}
