import { BodyShort, Heading, HStack, LocalAlert, Skeleton, Switch, Table, VStack } from '@navikt/ds-react';

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
            <VStack gap={'space-8'} marginBlock={'space-4 space-0'}>
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
        <VStack gap={'space-24'}>
            {kontantstøttebehandlingerError && (
                <LocalAlert status="warning">
                    <LocalAlert.Header>
                        <LocalAlert.Title>
                            Kontantstøttebehandlinger er ikke tilgjengelig for øyeblikket.
                        </LocalAlert.Title>
                    </LocalAlert.Header>
                    <LocalAlert.Content>
                        {kontantstøttebehandlingerError.message &&
                            `Feilmelding: ${kontantstøttebehandlingerError.message}`}
                    </LocalAlert.Content>
                </LocalAlert>
            )}
            {klagebehandlingError && (
                <LocalAlert status="warning">
                    <LocalAlert.Header>
                        <LocalAlert.Title>Klagebehandlinger er ikke tilgjengelig for øyeblikket.</LocalAlert.Title>
                    </LocalAlert.Header>
                    <LocalAlert.Content>
                        {klagebehandlingError.message && `Feilmelding: ${klagebehandlingError.message}`}
                    </LocalAlert.Content>
                </LocalAlert>
            )}
            {tilbakekrevingsbehandlingerError && (
                <LocalAlert status="warning">
                    <LocalAlert.Header>
                        <LocalAlert.Title>
                            Tilbakekrevingsbehandlinger er ikke tilgjengelig for øyeblikket.
                        </LocalAlert.Title>
                    </LocalAlert.Header>
                    <LocalAlert.Content>
                        {tilbakekrevingsbehandlingerError.message &&
                            `Feilmelding: ${tilbakekrevingsbehandlingerError.message}`}
                    </LocalAlert.Content>
                </LocalAlert>
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
