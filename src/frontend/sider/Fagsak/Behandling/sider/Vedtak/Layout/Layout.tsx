import type { PropsWithChildren } from 'react';
import { useState } from 'react';

import { Steg } from '@sider/Fagsak/Behandling/sider/Steg';
import { useVisTilGodkjenning } from '@sider/Fagsak/Behandling/sider/Vedtak/Layout/useVisTilGodkjenning';
import { SendtTilTotrinnskontrollModal } from '@sider/Fagsak/Behandling/sider/Vedtak/Totrinnskontroll/SendtTilTotrinnskontrollModal';

import { ErrorMessage, HStack, VStack } from '@navikt/ds-react';

import { TilForrigeSteg } from './TilForrigeSteg';
import { TilGodkjenning } from './TilGodkjenning';

export function Layout({ children }: PropsWithChildren) {
    const [feilmelding, settFeilmelding] = useState<string | undefined>(undefined);

    const visTilGodkjenning = useVisTilGodkjenning();

    return (
        <Steg tittel={'Vedtak'} maxWidth={'60rem'}>
            <SendtTilTotrinnskontrollModal />
            <VStack gap={'space-40'}>
                {children}
                {feilmelding && <ErrorMessage>{feilmelding}</ErrorMessage>}
                <HStack gap={'space-12'}>
                    <TilForrigeSteg />
                    {visTilGodkjenning && <TilGodkjenning settFeilmelding={settFeilmelding} />}
                </HStack>
            </VStack>
        </Steg>
    );
}
