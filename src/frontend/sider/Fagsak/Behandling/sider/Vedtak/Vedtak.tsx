import { useState } from 'react';

import { useBehandling } from '@hooks/useBehandling';
import { useErLesevisning } from '@hooks/useErLesevisning';
import { Steg } from '@sider/Fagsak/Behandling/sider/Steg';
import { TilForrigeSteg } from '@sider/Fagsak/Behandling/sider/Vedtak/TilForrigeSteg';
import { TilGodkjenning } from '@sider/Fagsak/Behandling/sider/Vedtak/TilGodkjenning';
import { SendtTilTotrinnskontrollModal } from '@sider/Fagsak/Behandling/sider/Vedtak/Totrinnskontroll/SendtTilTotrinnskontrollModal';
import { BehandlingStatus } from '@typer/behandling';

import { ErrorMessage, HStack, VStack } from '@navikt/ds-react';

import { OppsummeringVedtakInnhold } from './OppsummeringVedtakInnhold';

export function Vedtak() {
    const erLesevisning = useErLesevisning();
    const behandling = useBehandling();

    const [feilmelding, settFeilmelding] = useState<string | undefined>(undefined);

    const visTilGodkjenningKnapp = !erLesevisning && behandling.status === BehandlingStatus.UTREDES;

    return (
        <Steg tittel={'Vedtak'} maxWidth={'60rem'}>
            <SendtTilTotrinnskontrollModal />
            <VStack gap={'space-40'}>
                <OppsummeringVedtakInnhold />
                {feilmelding && <ErrorMessage>{feilmelding}</ErrorMessage>}
                <HStack gap={'space-12'}>
                    <TilForrigeSteg />
                    {visTilGodkjenningKnapp && <TilGodkjenning settFeilmelding={settFeilmelding} />}
                </HStack>
            </VStack>
        </Steg>
    );
}
