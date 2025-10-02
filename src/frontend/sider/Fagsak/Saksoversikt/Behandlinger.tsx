import React, { useState } from 'react';

import { differenceInMilliseconds } from 'date-fns';

import { Alert, BodyShort, Heading, Skeleton, Switch, Table, VStack } from '@navikt/ds-react';

import { Behandling } from './Behandling';
import styles from './Behandlinger.module.css';
import type { Saksoversiktsbehandling } from './utils';
import { hentBehandlingerTilSaksoversikten, hentBehandlingId, hentTidspunktForSortering, skalRadVises } from './utils';
import { useHentKlagebehandlinger } from '../../../hooks/useHentKlagebehandlinger';
import { useHentKontantstøttebehandlinger } from '../../../hooks/useHentKontantstøttebehandlinger';
import { useHentTilbakekrevingsbehandlinger } from '../../../hooks/useHentTilbakekrevingsbehandlinger';
import { isoStringTilDate } from '../../../utils/dato';

const TableHeader = () => {
    return (
        <Table.Header>
            <Table.Row>
                <Table.HeaderCell children={'Opprettet'} className={styles.opprettetKolonne} />
                <Table.HeaderCell children={'Årsak'} />
                <Table.HeaderCell children={'Type'} />
                <Table.HeaderCell children={'Behandlingstema'} />
                <Table.HeaderCell children={'Status'} />
                <Table.HeaderCell children={'Vedtaksdato'} />
                <Table.HeaderCell children={'Resultat'} className={styles.resultatKolonne} />
            </Table.Row>
        </Table.Header>
    );
};

type Props = {
    fagsakId: number;
};

export function Behandlinger({ fagsakId }: Props) {
    const [visHenlagteBehandlinger, setVisHenlagteBehandlinger] = useState(false);

    const {
        data: kontantstøttebehandlinger,
        isPending: hentKontantstøttebehandlingerLaster,
        error: hentKontantstøttebehandlingerError,
    } = useHentKontantstøttebehandlinger(fagsakId);

    const {
        data: klagebehandlinger,
        isPending: hentKlagebehandlingLaster,
        error: hentKlagebehandlingError,
    } = useHentKlagebehandlinger(fagsakId);

    const {
        data: tilbakekrevingsbehandlinger,
        isPending: hentTilbakekrevingsbehandlingerLaster,
        error: hentTilbakekrevingsbehandlingerError,
    } = useHentTilbakekrevingsbehandlinger(fagsakId);

    const behandlingerLaster =
        hentKlagebehandlingLaster || hentTilbakekrevingsbehandlingerLaster || hentKontantstøttebehandlingerLaster;

    if (behandlingerLaster) {
        return (
            <VStack gap={'2'} marginBlock={'1 0'}>
                <Heading level={'2'} size={'medium'} spacing={true}>
                    Behandlinger
                </Heading>
                <Table size={'large'}>
                    <TableHeader />
                    <Table.Body />
                </Table>
                <Skeleton variant={'rectangle'} width={'100%'} height={'2.5rem'} />
                <Skeleton variant={'rectangle'} width={'100%'} height={'2.5rem'} />
                <Skeleton variant={'rectangle'} width={'100%'} height={'2.5rem'} />
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
        <VStack gap="6">
            {hentKontantstøttebehandlingerError !== null && (
                <Alert variant="warning">
                    <VStack gap={'4'}>
                        <BodyShort>Kontantstøttebehandlinger er ikke tilgjengelig for øyeblikket.</BodyShort>
                        {hentKontantstøttebehandlingerError.message && (
                            <BodyShort>Feilmelding: {hentKontantstøttebehandlingerError.message}</BodyShort>
                        )}
                    </VStack>
                </Alert>
            )}
            {hentKlagebehandlingError !== null && (
                <Alert variant="warning">
                    <VStack gap={'4'}>
                        <BodyShort>Klagebehandlinger er ikke tilgjengelig for øyeblikket.</BodyShort>
                        {hentKlagebehandlingError.message && (
                            <BodyShort>Feilmelding: {hentKlagebehandlingError.message}</BodyShort>
                        )}
                    </VStack>
                </Alert>
            )}
            {hentTilbakekrevingsbehandlingerError !== null && (
                <Alert variant="warning">
                    <VStack gap={'4'}>
                        <BodyShort>Tilbakekrevingsbehandlinger er ikke tilgjengelig for øyeblikket.</BodyShort>
                        {hentTilbakekrevingsbehandlingerError.message && (
                            <BodyShort>Feilmelding: {hentTilbakekrevingsbehandlingerError.message}</BodyShort>
                        )}
                    </VStack>
                </Alert>
            )}
            <div>
                <Heading level="2" size={'medium'} spacing={true}>
                    Behandlinger
                    {finnesRadSomKanFiltreresBort && (
                        <Switch
                            size={'small'}
                            className={styles.switchHøyre}
                            position={'left'}
                            checked={visHenlagteBehandlinger}
                            onChange={() => setVisHenlagteBehandlinger(!visHenlagteBehandlinger)}
                        >
                            Vis henlagte behandlinger
                        </Switch>
                    )}
                </Heading>
                {saksoversiktbehandlinger.length > 0 ? (
                    <Table size={'large'}>
                        <TableHeader />
                        <Table.Body>
                            {saksoversiktbehandlinger
                                .filter(behandling => skalRadVises(behandling, visHenlagteBehandlinger))
                                .sort((a, b) =>
                                    differenceInMilliseconds(
                                        isoStringTilDate(hentTidspunktForSortering(b)),
                                        isoStringTilDate(hentTidspunktForSortering(a))
                                    )
                                )
                                .map((behandling: Saksoversiktsbehandling) => (
                                    <Behandling
                                        key={hentBehandlingId(behandling)}
                                        saksoversiktsbehandling={behandling}
                                        fagsakId={fagsakId}
                                    />
                                ))}
                        </Table.Body>
                    </Table>
                ) : (
                    <BodyShort>Ingen tidligere behandlinger</BodyShort>
                )}
            </div>
        </VStack>
    );
}
