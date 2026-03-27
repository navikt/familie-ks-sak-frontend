import { Link as ReactRouterLink } from 'react-router';
import styled from 'styled-components';

import { BodyShort, Box, HStack, Link, LinkCard, VStack } from '@navikt/ds-react';
import { FontSizeHeadingMedium, FontSizeXlarge, Space16, Space64 } from '@navikt/ds-tokens/dist/tokens';

import type { VisningBehandling } from './visningBehandling';
import { BehandlingStatus } from '../../../typer/behandling';
import type { IBehandlingstema } from '../../../typer/behandlingstema';
import { tilBehandlingstema } from '../../../typer/behandlingstema';
import { hentAktivBehandlingPåMinimalFagsak, hentFagsakStatusVisning } from '../../../utils/fagsak';
import { useFagsakContext } from '../FagsakContext';

const HeaderTekst = styled(BodyShort)`
    font-size: ${FontSizeXlarge};
`;

const BodyTekst = styled(BodyShort)`
    font-size: ${FontSizeHeadingMedium};
`;

function Innholdstabell() {
    const { fagsak } = useFagsakContext();
    const behandlingstema: IBehandlingstema | undefined =
        fagsak.løpendeKategori && tilBehandlingstema(fagsak.løpendeKategori);

    return (
        <HStack gap="space-80">
            <div>
                <HeaderTekst for={'behandlingstema'} spacing>
                    Behandlingstema
                </HeaderTekst>
                <BodyTekst name={'behandlingstema'} weight="semibold">
                    {behandlingstema ? behandlingstema.navn : '-'}
                </BodyTekst>
            </div>
            <div>
                <HeaderTekst for={'status'} spacing>
                    Status
                </HeaderTekst>
                <BodyTekst name={'status'} weight="semibold">
                    {hentFagsakStatusVisning(fagsak)}
                </BodyTekst>
            </div>
        </HStack>
    );
}

export const SaksoversiktPanelBredde = `calc(10 * ${Space64})`;

const FagsakPanel = styled(Box)`
    width: ${SaksoversiktPanelBredde};
    margin-top: ${Space16};
`;

const genererLinkTekst = (behandling: VisningBehandling) => {
    return behandling.status === BehandlingStatus.AVSLUTTET ? 'Gå til gjeldende vedtak' : 'Gå til åpen behandling';
};

export function FagsakLenkepanel() {
    const { fagsak } = useFagsakContext();
    const aktivBehandling: VisningBehandling | undefined = hentAktivBehandlingPåMinimalFagsak(fagsak);

    return aktivBehandling ? (
        <Box width={SaksoversiktPanelBredde} marginBlock={'space-32 space-0'}>
            <LinkCard>
                <LinkCard.Title>
                    <LinkCard.Anchor asChild={true}>
                        <Link as={ReactRouterLink} to={`/fagsak/${fagsak.id}/${aktivBehandling.behandlingId}`}>
                            {genererLinkTekst(aktivBehandling)}
                        </Link>
                    </LinkCard.Anchor>
                </LinkCard.Title>
                <LinkCard.Description>
                    <VStack paddingBlock={'space-16 space-0'}>
                        <Innholdstabell />
                    </VStack>
                </LinkCard.Description>
            </LinkCard>
        </Box>
    ) : (
        <FagsakPanel borderColor="neutral-strong" borderWidth="1" borderRadius="2" padding="space-32">
            <Innholdstabell />
        </FagsakPanel>
    );
}
