import { Alert, BodyShort, Heading, HStack, Skeleton, Switch, Table, VStack } from '@navikt/ds-react';

import { Behandling } from './Behandling';
import styles from './Behandlinger.module.css';
import type { Saksoversiktsbehandling } from './utils';
import { hentBehandlingerTilSaksoversikten, hentBehandlingId, skalRadVises } from './utils';
import { useHentKlagebehandlinger } from '../../../hooks/useHentKlagebehandlinger';
import { useHentKontantstøttebehandlinger } from '../../../hooks/useHentKontantstøttebehandlinger';
import { useHentTilbakekrevingsbehandlinger } from '../../../hooks/useHentTilbakekrevingsbehandlinger';
import { useToggle } from '../../../hooks/useToggle';
import { useFagsakContext } from '../FagsakContext';

function TableHeader() {
    return (
        <Table.Header>
            <Table.Row>
                <Table.HeaderCell scope={'col'} className={styles.opprettetKolonne}>
                    Opprettet
                </Table.HeaderCell>
                <Table.HeaderCell scope={'col'}>Årsak</Table.HeaderCell>
                <Table.HeaderCell scope={'col'}>Type</Table.HeaderCell>
                <Table.HeaderCell scope={'col'}>Behandlingstema</Table.HeaderCell>
                <Table.HeaderCell scope={'col'}>Status</Table.HeaderCell>
                <Table.HeaderCell scope={'col'}>Vedtaksdato</Table.HeaderCell>
                <Table.HeaderCell scope={'col'} className={styles.resultatKolonne}>
                    Resultat
                </Table.HeaderCell>
            </Table.Row>
        </Table.Header>
    );
}

export function Behandlinger() {
    const { fagsak } = useFagsakContext();

    const [visHenlagteBehandlinger, toggleVisHenlagteBehandlinger] = useToggle(false);

    const {
        data: kontantstøttebehandlinger,
        isPending: kontantstøttebehandlingerLaster,
        error: kontantstøttebehandlingerError,
    } = useHentKontantstøttebehandlinger(fagsak.id);

    const {
        data: klagebehandlinger,
        isPending: klagebehandlingLaster,
        error: klagebehandlingError,
    } = useHentKlagebehandlinger(fagsak.id);

    const {
        data: tilbakekrevingsbehandlinger,
        isPending: tilbakekrevingsbehandlingerLaster,
        error: tilbakekrevingsbehandlingerError,
    } = useHentTilbakekrevingsbehandlinger(fagsak.id);

    if (klagebehandlingLaster || tilbakekrevingsbehandlingerLaster || kontantstøttebehandlingerLaster) {
        return (
            <VStack gap={'2'} marginBlock={'1 0'}>
                <HStack width={'100%'} align={'center'} justify={'space-between'}>
                    <Heading level={'2'} size={'medium'} spacing={true}>
                        Behandlinger
                    </Heading>
                </HStack>
                <Table size={'large'} stickyHeader={true}>
                    <TableHeader />
                    <Table.Body />
                </Table>
                <Skeleton data-testid={'skeleton'} variant={'rectangle'} width={'100%'} height={'2.5rem'} />
                <Skeleton data-testid={'skeleton'} variant={'rectangle'} width={'100%'} height={'2.5rem'} />
                <Skeleton data-testid={'skeleton'} variant={'rectangle'} width={'100%'} height={'2.5rem'} />
            </VStack>
        );
    }

    const saksoversiktbehandlinger = hentBehandlingerTilSaksoversikten(
        kontantstøttebehandlinger ?? [],
        klagebehandlinger ?? [],
        tilbakekrevingsbehandlinger ?? []
    );

    const finnesRadSomKanFiltreresBort = saksoversiktbehandlinger.some(
        (behandling: Saksoversiktsbehandling) => !skalRadVises(behandling, false)
    );

    return (
        <VStack gap={'6'}>
            {kontantstøttebehandlingerError && (
                <Alert variant={'warning'}>
                    <VStack gap={'4'}>
                        <BodyShort>Kontantstøttebehandlinger er ikke tilgjengelig for øyeblikket.</BodyShort>
                        {kontantstøttebehandlingerError.message && (
                            <BodyShort>Feilmelding: {kontantstøttebehandlingerError.message}</BodyShort>
                        )}
                    </VStack>
                </Alert>
            )}
            {klagebehandlingError && (
                <Alert variant={'warning'}>
                    <VStack gap={'4'}>
                        <BodyShort>Klagebehandlinger er ikke tilgjengelig for øyeblikket.</BodyShort>
                        {klagebehandlingError.message && (
                            <BodyShort>Feilmelding: {klagebehandlingError.message}</BodyShort>
                        )}
                    </VStack>
                </Alert>
            )}
            {tilbakekrevingsbehandlingerError && (
                <Alert variant={'warning'}>
                    <VStack gap={'4'}>
                        <BodyShort>Tilbakekrevingsbehandlinger er ikke tilgjengelig for øyeblikket.</BodyShort>
                        {tilbakekrevingsbehandlingerError.message && (
                            <BodyShort>Feilmelding: {tilbakekrevingsbehandlingerError.message}</BodyShort>
                        )}
                    </VStack>
                </Alert>
            )}
            <div>
                <HStack width={'100%'} align={'end'} justify={'space-between'}>
                    <Heading level={'2'} size={'medium'} spacing={true}>
                        Behandlinger
                    </Heading>
                    {finnesRadSomKanFiltreresBort && (
                        <Switch
                            size={'small'}
                            checked={visHenlagteBehandlinger}
                            onChange={toggleVisHenlagteBehandlinger}
                        >
                            Vis henlagte behandlinger
                        </Switch>
                    )}
                </HStack>
                {saksoversiktbehandlinger.length === 0 && <BodyShort>Ingen tidligere behandlinger.</BodyShort>}
                {saksoversiktbehandlinger.length > 0 && (
                    <Table size={'large'} stickyHeader={true}>
                        <TableHeader />
                        <Table.Body>
                            {saksoversiktbehandlinger
                                .filter(behandling => skalRadVises(behandling, visHenlagteBehandlinger))
                                .map(behandling => (
                                    <Behandling
                                        key={hentBehandlingId(behandling)}
                                        saksoversiktsbehandling={behandling}
                                    />
                                ))}
                        </Table.Body>
                    </Table>
                )}
            </div>
        </VStack>
    );
}
