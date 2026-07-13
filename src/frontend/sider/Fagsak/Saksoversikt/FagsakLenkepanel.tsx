import { BehandlingStatus } from '@typer/behandling';
import type { IBehandlingstema } from '@typer/behandlingstema';
import { tilBehandlingstema } from '@typer/behandlingstema';
import { hentAktivBehandlingPåMinimalFagsak, hentFagsakStatusVisning } from '@utils/fagsak';
import { Link as ReactRouterLink } from 'react-router';

import { BodyShort, Box, HStack, Link, LinkCard, VStack } from '@navikt/ds-react';
import { Space64 } from '@navikt/ds-tokens/dist/tokens';

import type { VisningBehandling } from './visningBehandling';
import { useFagsakContext } from '../FagsakContext';
import styles from './FagsakLenkepanel.module.css';

function Innholdstabell() {
    const { fagsak } = useFagsakContext();
    const behandlingstema: IBehandlingstema | undefined =
        fagsak.løpendeKategori && tilBehandlingstema(fagsak.løpendeKategori);

    return (
        <HStack gap="space-80">
            <div>
                <BodyShort className={styles.header} spacing>
                    Behandlingstema
                </BodyShort>
                <BodyShort className={styles.body} weight="semibold">
                    {behandlingstema ? behandlingstema.navn : '-'}
                </BodyShort>
            </div>
            <div>
                <BodyShort className={styles.header} spacing>
                    Status
                </BodyShort>
                <BodyShort className={styles.body} weight="semibold">
                    {hentFagsakStatusVisning(fagsak)}
                </BodyShort>
            </div>
        </HStack>
    );
}

export const SaksoversiktPanelBredde = `calc(10 * ${Space64})`;

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
        <Box
            width={SaksoversiktPanelBredde}
            marginBlock={'space-16 space-0'}
            borderColor="neutral-strong"
            borderWidth="1"
            borderRadius="2"
            padding="space-32"
        >
            <Innholdstabell />
        </Box>
    );
}
