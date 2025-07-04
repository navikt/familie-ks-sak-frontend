import type { ReactNode } from 'react';
import React from 'react';

import { ExternalLinkIcon } from '@navikt/aksel-icons';
import { HStack, Link, Tooltip } from '@navikt/ds-react';

import type { VisningBehandling } from './visningBehandling';
import StatusIkon, { Status } from '../../../ikoner/StatusIkon';
import {
    behandlingsresultater,
    BehandlingStatus,
    behandlingstyper,
    behandlingÅrsak,
    erBehandlingHenlagt,
} from '../../../typer/behandling';
import type { IBehandlingstema } from '../../../typer/behandlingstema';
import { tilBehandlingstema } from '../../../typer/behandlingstema';
import type { IMinimalFagsak } from '../../../typer/fagsak';
import {
    erKlageFeilregistrertAvKA,
    harAnkeEksistertPåKlagebehandling,
    type IKlagebehandling,
    utledKlagebehandlingResultattekst,
} from '../../../typer/klage';
import { Klagebehandlingstype } from '../../../typer/klage';
import type { ITilbakekrevingsbehandling } from '../../../typer/tilbakekrevingsbehandling';
import {
    Behandlingsresultatstype,
    Tilbakekrevingsbehandlingstype,
} from '../../../typer/tilbakekrevingsbehandling';

enum Saksoversiktstype {
    KONTANTSTØTTE = 'KONTANTSTØTTE',
    TILBAKEBETALING = 'TILBAKEBETALING',
    KLAGE = 'KLAGE',
}

export type Saksoversiktsbehandling =
    | (VisningBehandling & {
          saksoversiktstype: Saksoversiktstype.KONTANTSTØTTE;
      })
    | (ITilbakekrevingsbehandling & {
          saksoversiktstype: Saksoversiktstype.TILBAKEBETALING;
      })
    | (IKlagebehandling & {
          saksoversiktstype: Saksoversiktstype.KLAGE;
      });

export const skalRadVises = (
    behandling: Saksoversiktsbehandling,
    visHenlagteBehandlinger: boolean
): boolean => {
    if (visHenlagteBehandlinger) return true;
    if (!behandling.resultat) return true;
    if (behandling.saksoversiktstype === Saksoversiktstype.KONTANTSTØTTE) {
        return !erBehandlingHenlagt(behandling.resultat);
    }
    return Behandlingsresultatstype.HENLAGT !== behandling.resultat;
};

export const hentOpprettetTidspunkt = (saksoversiktsbehandling: Saksoversiktsbehandling) => {
    switch (saksoversiktsbehandling.saksoversiktstype) {
        case Saksoversiktstype.KONTANTSTØTTE:
        case Saksoversiktstype.TILBAKEBETALING:
            return saksoversiktsbehandling.opprettetTidspunkt;
        case Saksoversiktstype.KLAGE:
            return saksoversiktsbehandling.opprettet;
    }
};

export const hentTidspunktForSortering = (saksoversiktsbehandling: Saksoversiktsbehandling) => {
    switch (saksoversiktsbehandling.saksoversiktstype) {
        case Saksoversiktstype.KONTANTSTØTTE:
            return saksoversiktsbehandling.aktivertTidspunkt;
        case Saksoversiktstype.TILBAKEBETALING:
            return saksoversiktsbehandling.opprettetTidspunkt;
        case Saksoversiktstype.KLAGE:
            return saksoversiktsbehandling.opprettet;
    }
};

export const hentBehandlingId = (saksoversiktsbehandling: Saksoversiktsbehandling) => {
    switch (saksoversiktsbehandling.saksoversiktstype) {
        case Saksoversiktstype.KONTANTSTØTTE:
        case Saksoversiktstype.TILBAKEBETALING:
            return saksoversiktsbehandling.behandlingId;
        case Saksoversiktstype.KLAGE:
            return saksoversiktsbehandling.id;
    }
};

export const hentBehandlingerTilSaksoversikten = (
    minimalFagsak: IMinimalFagsak,
    klagebehandlinger: IKlagebehandling[],
    tilbakekrevingsbehandlinger: ITilbakekrevingsbehandling[]
): Saksoversiktsbehandling[] => {
    const kontantstøtteBehandlinger: Saksoversiktsbehandling[] = minimalFagsak.behandlinger.map(
        behandling => ({
            ...behandling,
            saksoversiktstype: Saksoversiktstype.KONTANTSTØTTE,
        })
    );
    const saksoversiktTilbakekrevingsbehandlinger: Saksoversiktsbehandling[] =
        tilbakekrevingsbehandlinger.map(behandling => ({
            ...behandling,
            saksoversiktstype: Saksoversiktstype.TILBAKEBETALING,
        }));
    const saksoversiktKlagebehandlinger: Saksoversiktsbehandling[] = klagebehandlinger.map(
        behandling => ({
            ...behandling,
            saksoversiktstype: Saksoversiktstype.KLAGE,
        })
    );
    return [
        ...kontantstøtteBehandlinger,
        ...saksoversiktTilbakekrevingsbehandlinger,
        ...saksoversiktKlagebehandlinger,
    ];
};

export const lagLenkePåType = (
    fagsakId: number,
    behandling: Saksoversiktsbehandling
): ReactNode => {
    switch (behandling.saksoversiktstype) {
        case Saksoversiktstype.KONTANTSTØTTE:
            if (behandling.status === BehandlingStatus.AVSLUTTET) {
                return behandlingstyper[behandling.type].navn;
            }
            return (
                <Link href={`/fagsak/${fagsakId}/${behandling.behandlingId}`}>
                    {behandlingstyper[behandling.type].navn}
                </Link>
            );
        case Saksoversiktstype.TILBAKEBETALING:
            return (
                <Link
                    href={`/redirect/familie-tilbake/fagsystem/KS/fagsak/${fagsakId}/behandling/${behandling.behandlingId}`}
                    onMouseDown={e => e.preventDefault()}
                    target="_blank"
                >
                    <span>{behandlingstyper[behandling.type].navn}</span>
                    <ExternalLinkIcon fontSize={'1.5rem'} />
                </Link>
            );
        case Saksoversiktstype.KLAGE:
            return (
                <Link
                    href={`/redirect/familie-klage/behandling/${behandling.id}`}
                    onMouseDown={e => e.preventDefault()}
                    target="_blank"
                >
                    <span>{behandlingstyper[Klagebehandlingstype.KLAGE].navn}</span>
                    <ExternalLinkIcon fontSize={'1.5rem'} />
                </Link>
            );
    }
};

export const lagLenkePåResultat = (
    minimalFagsak: IMinimalFagsak,
    behandling: Saksoversiktsbehandling
): ReactNode => {
    if (!behandling.resultat) {
        return '-';
    }
    switch (behandling.saksoversiktstype) {
        case Saksoversiktstype.KONTANTSTØTTE:
            if (behandling.status === BehandlingStatus.AVSLUTTET) {
                return (
                    <Link href={`/fagsak/${minimalFagsak.id}/${behandling.behandlingId}`}>
                        {behandling ? behandlingsresultater[behandling.resultat] : '-'}
                    </Link>
                );
            }
            return behandlingsresultater[behandling.resultat];
        case Saksoversiktstype.TILBAKEBETALING:
            return (
                <Link
                    href={`/redirect/familie-tilbake/fagsystem/KS/fagsak/${minimalFagsak.id}/behandling/${behandling.behandlingId}`}
                    onMouseDown={e => e.preventDefault()}
                    target="_blank"
                >
                    <span>{behandlingsresultater[behandling.resultat]}</span>
                    <ExternalLinkIcon fontSize={'1.5rem'} />
                </Link>
            );
        case Saksoversiktstype.KLAGE:
            return (
                <HStack gap={'2'}>
                    <Link
                        href={`/redirect/familie-klage/behandling/${behandling.id}`}
                        onMouseDown={event => event.preventDefault()}
                        target={'_blank'}
                    >
                        <span>{utledKlagebehandlingResultattekst(behandling)}</span>
                        <ExternalLinkIcon fontSize={'1.5rem'} />
                    </Link>
                    {harAnkeEksistertPåKlagebehandling(behandling) && (
                        <Tooltip
                            content={
                                'Det finnes informasjon om anke på denne klagen. ' +
                                'Gå inn på klagebehandlingens resultatside for å se detaljer.'
                            }
                        >
                            <StatusIkon status={Status.ADVARSEL} />
                        </Tooltip>
                    )}
                    {erKlageFeilregistrertAvKA(behandling) && (
                        <Tooltip
                            content={
                                'Klagen er feilregistrert av Nav klageinstans. ' +
                                'Gå inn på klagebehandlingens resultatside for å se detaljer'
                            }
                        >
                            <StatusIkon
                                status={Status.ADVARSEL}
                                title={'Behandling feilregistrert av Nav klageinstans'}
                            />
                        </Tooltip>
                    )}
                </HStack>
            );
    }
};

export const finnÅrsak = (saksoversiktsbehandling: Saksoversiktsbehandling): ReactNode => {
    if (
        saksoversiktsbehandling.saksoversiktstype === Saksoversiktstype.TILBAKEBETALING &&
        saksoversiktsbehandling.type === Tilbakekrevingsbehandlingstype.TILBAKEKREVING
    ) {
        return 'Feilutbetaling';
    }
    return saksoversiktsbehandling.årsak ? behandlingÅrsak[saksoversiktsbehandling.årsak] : '-';
};

export const hentBehandlingstema = (
    saksoversiktsbehandling: Saksoversiktsbehandling
): IBehandlingstema | undefined => {
    switch (saksoversiktsbehandling.saksoversiktstype) {
        case Saksoversiktstype.KONTANTSTØTTE:
            return tilBehandlingstema(saksoversiktsbehandling.kategori);
        case Saksoversiktstype.TILBAKEBETALING:
        case Saksoversiktstype.KLAGE:
            return undefined;
    }
};
