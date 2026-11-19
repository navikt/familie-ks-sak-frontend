import { useBehandling } from '@hooks/useBehandling';
import { useErViPåUgyldigSideForBehandling } from '@hooks/useErViPåUgyldigSideForBehandling';
import { useFagsak } from '@hooks/useFagsak';
import { BodyLong, Box, Button, GlobalAlert, VStack } from '@navikt/ds-react';
import { finnSideForBehandlingssteg } from '@sider/Fagsak/Behandling/sider/sider';
import { Link as ReactRouterLink } from 'react-router';

export function UgyldigSideAdvarsel() {
    const fagsak = useFagsak();
    const behandling = useBehandling();
    const erViPåUgyldigSideForBehandling = useErViPåUgyldigSideForBehandling(behandling);

    if (!erViPåUgyldigSideForBehandling) {
        return null;
    }

    const side = finnSideForBehandlingssteg(behandling);

    return (
        <GlobalAlert status={'warning'} centered={false}>
            <GlobalAlert.Header>
                <GlobalAlert.Title>
                    Du befinner deg på en side som ikke er tilgjengelig for behandlingen.
                </GlobalAlert.Title>
            </GlobalAlert.Header>
            <GlobalAlert.Content>
                <Box margin={'space-16'}>
                    <VStack gap={'space-24'} align={'start'}>
                        <BodyLong>
                            Siden hører til et steg behandlingen ikke har kommet til ennå, eller den er ikke relevant
                            for denne behandlingen. Dette kan skje hvis behandlingen er flyttet tilbake til et tidligere
                            steg, eller hvis du har åpnet en lenke til en side som ikke gjelder behandlingen. Siden
                            vises i lesevisning.
                            {side && <> Gjeldende side for behandlingen er «{side.navn}».</>}
                        </BodyLong>
                        {side && (
                            <Button
                                as={ReactRouterLink}
                                to={`/fagsak/${fagsak.id}/${behandling.behandlingId}/${side.href}`}
                                size={'small'}
                                variant={'primary'}
                            >
                                Gå til {side.navn.toLowerCase()}
                            </Button>
                        )}
                    </VStack>
                </Box>
            </GlobalAlert.Content>
        </GlobalAlert>
    );
}
