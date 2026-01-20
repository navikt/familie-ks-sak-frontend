import { Link as ReactRouterLink } from 'react-router';
import styled from 'styled-components';

import { BodyShort, Box, HStack, Link, LinkCard, VStack } from '@navikt/ds-react';
import { AFontSizeHeadingMedium, AFontSizeXlarge, ASpacing16, ASpacing4 } from '@navikt/ds-tokens/dist/tokens';

import type { VisningBehandling } from './visningBehandling';
import { BehandlingStatus } from '../../../typer/behandling';
import type { IBehandlingstema } from '../../../typer/behandlingstema';
import { tilBehandlingstema } from '../../../typer/behandlingstema';
import { hentAktivBehandlingPåMinimalFagsak, hentFagsakStatusVisning } from '../../../utils/fagsak';
import { useFagsakContext } from '../FagsakContext';

const HeaderTekst = styled(BodyShort)`
    font-size: ${AFontSizeXlarge};
`;

const BodyTekst = styled(BodyShort)`
    font-size: ${AFontSizeHeadingMedium};
`;

function Innholdstabell() {
    const { fagsak } = useFagsakContext();
    const behandlingstema: IBehandlingstema | undefined =
        fagsak.løpendeKategori && tilBehandlingstema(fagsak.løpendeKategori);

    return (
        <HStack gap="20">
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

export const SaksoversiktPanelBredde = `calc(10 * ${ASpacing16})`;

const FagsakPanel = styled(Box)`
    width: ${SaksoversiktPanelBredde};
    margin-top: ${ASpacing4};
`;

const genererLinkTekst = (behandling: VisningBehandling) => {
    return behandling.status === BehandlingStatus.AVSLUTTET ? 'Gå til gjeldende vedtak' : 'Gå til åpen behandling';
};

export function FagsakLenkepanel() {
    const { fagsak } = useFagsakContext();
    const aktivBehandling: VisningBehandling | undefined = hentAktivBehandlingPåMinimalFagsak(fagsak);

    return aktivBehandling ? (
        <Box width={SaksoversiktPanelBredde} marginBlock={'8 0'}>
            <LinkCard>
                <LinkCard.Title>
                    <LinkCard.Anchor asChild={true}>
                        <Link as={ReactRouterLink} to={`/fagsak/${fagsak.id}/${aktivBehandling.behandlingId}`}>
                            {genererLinkTekst(aktivBehandling)}
                        </Link>
                    </LinkCard.Anchor>
                </LinkCard.Title>
                <LinkCard.Description>
                    <VStack paddingBlock={'4 0'}>
                        <Innholdstabell />
                    </VStack>
                </LinkCard.Description>
            </LinkCard>
        </Box>
    ) : (
        <FagsakPanel borderColor="border-strong" borderWidth="1" borderRadius="small" padding="8">
            <Innholdstabell />
        </FagsakPanel>
    );
}
