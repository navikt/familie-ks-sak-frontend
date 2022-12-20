import type { ReactNode } from 'react';
import React from 'react';

import { ExternalLink } from '@navikt/ds-icons';
import { Link } from '@navikt/ds-react';

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
import type { IKlagebehandling } from '../../../typer/klage';
import { Klagebehandlingstype } from '../../../typer/klage';
import type { ITilbakekrevingsbehandling } from '../../../typer/tilbakekrevingsbehandling';
import {
    Behandlingsresultatstype,
    Tilbakekrevingsbehandlingstype,
} from '../../../typer/tilbakekrevingsbehandling';
import type { VisningBehandling } from './visningBehandling';

export enum Saksoversiktstype {
    KONTANTSTØTTE = 'KONTANTSTØTTE',
    TIlBAKEBETALING = 'TILBAKBETALING',
    KLAGE = 'KLAGE',
}

export type Saksoversiktsbehanlding =
    | (VisningBehandling & {
          saksoversiktstype: Saksoversiktstype.KONTANTSTØTTE;
      })
    | (ITilbakekrevingsbehandling & {
          saksoversiktstype: Saksoversiktstype.TIlBAKEBETALING;
      })
    | (IKlagebehandling & {
          saksoversiktstype: Saksoversiktstype.KLAGE;
      });

export const skalRadVises = (
    behandling: Saksoversiktsbehanlding,
    visHenlagteBehandlinger: boolean
): boolean => {
    if (visHenlagteBehandlinger) return true;
    if (!behandling.resultat) return true;
    if (behandling.saksoversiktstype === Saksoversiktstype.KONTANTSTØTTE) {
        return !erBehandlingHenlagt(behandling.resultat);
    }
    return Behandlingsresultatstype.HENLAGT !== behandling.resultat;
};

export const hentOpprettetTidspunkt = (saksoversiktsbehandling: Saksoversiktsbehanlding) => {
    switch (saksoversiktsbehandling.saksoversiktstype) {
        case Saksoversiktstype.KONTANTSTØTTE:
        case Saksoversiktstype.TIlBAKEBETALING:
            return saksoversiktsbehandling.opprettetTidspunkt;
        case Saksoversiktstype.KLAGE:
            return saksoversiktsbehandling.opprettet;
    }
};

export const hentBehandlingId = (saksoversiktsbehandling: Saksoversiktsbehanlding) => {
    switch (saksoversiktsbehandling.saksoversiktstype) {
        case Saksoversiktstype.KONTANTSTØTTE:
        case Saksoversiktstype.TIlBAKEBETALING:
            return saksoversiktsbehandling.behandlingId;
        case Saksoversiktstype.KLAGE:
            return saksoversiktsbehandling.id;
    }
};

export const hentBehandlingerTilSaksoversikten = (
    minimalFagsak: IMinimalFagsak,
    klagebehandlinger: IKlagebehandling[]
): Saksoversiktsbehanlding[] => {
    const kontantstøtteBehandlinger: Saksoversiktsbehanlding[] = minimalFagsak.behandlinger.map(
        behandling => ({
            ...behandling,
            saksoversiktstype: Saksoversiktstype.KONTANTSTØTTE,
        })
    );
    const tilbakekrevingsbehandlinger: Saksoversiktsbehanlding[] =
        minimalFagsak.tilbakekrevingsbehandlinger.map(behandling => ({
            ...behandling,
            saksoversiktstype: Saksoversiktstype.TIlBAKEBETALING,
        }));
    const klagebehanldinger: Saksoversiktsbehanlding[] = klagebehandlinger.map(behandling => ({
        ...behandling,
        saksoversiktstype: Saksoversiktstype.KLAGE,
    }));
    return [...kontantstøtteBehandlinger, ...tilbakekrevingsbehandlinger, ...klagebehanldinger];
};

export const lagLenkePåType = (
    fagsakId: number,
    behanlding: Saksoversiktsbehanlding
): ReactNode => {
    switch (behanlding.saksoversiktstype) {
        case Saksoversiktstype.KONTANTSTØTTE:
            if (behanlding.status === BehandlingStatus.AVSLUTTET) {
                return behandlingstyper[behanlding.type].navn;
            }
            return (
                <Link href={`/fagsak/${fagsakId}/${behanlding.behandlingId}`}>
                    {behandlingstyper[behanlding.type].navn}
                </Link>
            );
        case Saksoversiktstype.TIlBAKEBETALING:
            return (
                <Link
                    href={`/redirect/familie-tilbake/fagsystem/KS/fagsak/${fagsakId}/behandling/${behanlding.behandlingId}`}
                    onMouseDown={e => e.preventDefault()}
                    target="_blank"
                >
                    <span>{behandlingstyper[behanlding.type].navn}</span>
                    <ExternalLink />
                </Link>
            );
        case Saksoversiktstype.KLAGE:
            return (
                <Link
                    href={`/redirect/familie-klage/behandling/${behanlding.id}`}
                    onMouseDown={e => e.preventDefault()}
                    target="_blank"
                >
                    <span>{behandlingstyper[Klagebehandlingstype.KLAGE].navn}</span>
                    <ExternalLink />
                </Link>
            );
    }
};

export const lagLenkePåResultat = (
    minimalFagsak: IMinimalFagsak,
    behandling: Saksoversiktsbehanlding
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
        case Saksoversiktstype.TIlBAKEBETALING:
            return (
                <Link
                    href={`/redirect/familie-tilbake/fagsystem/KS/fagsak/${minimalFagsak.id}/behandling/${behandling.behandlingId}`}
                    onMouseDown={e => e.preventDefault()}
                    target="_blank"
                >
                    <span>{behandlingsresultater[behandling.resultat]}</span>
                    <ExternalLink />
                </Link>
            );
        case Saksoversiktstype.KLAGE:
            return (
                <Link
                    href={`/redirect/familie-klage/behandling/${behandling.id}`}
                    onMouseDown={e => e.preventDefault()}
                    target="_blank"
                >
                    <span>{behandlingsresultater[behandling.resultat]}</span>
                    <ExternalLink />
                </Link>
            );
    }
};

export const finnÅrsak = (saksoversikstbehandling: Saksoversiktsbehanlding): ReactNode => {
    if (
        saksoversikstbehandling.saksoversiktstype === Saksoversiktstype.TIlBAKEBETALING &&
        saksoversikstbehandling.type === Tilbakekrevingsbehandlingstype.TILBAKEKREVING
    ) {
        return 'Feilutbetaling';
    }
    return saksoversikstbehandling.årsak ? behandlingÅrsak[saksoversikstbehandling.årsak] : '-';
};

export const hentBehandlingstema = (
    saksoversiktsbehandling: Saksoversiktsbehanlding
): IBehandlingstema | undefined => {
    switch (saksoversiktsbehandling.saksoversiktstype) {
        case Saksoversiktstype.KONTANTSTØTTE:
            return tilBehandlingstema(saksoversiktsbehandling.kategori);
        case Saksoversiktstype.TIlBAKEBETALING:
        case Saksoversiktstype.KLAGE:
            return undefined;
    }
};
