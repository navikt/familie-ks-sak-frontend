import type { ReactNode } from 'react';
import React from 'react';

import { ExternalLink } from '@navikt/ds-icons';
import { Link } from '@navikt/ds-react';

import {
    behandlingsresultater,
    behandlingsstatuser,
    BehandlingStatus,
    behandlingstyper,
    behandlingÅrsak,
} from '../../../typer/behandling';
import type { IBehandlingstema } from '../../../typer/behandlingstema';
import {
    hentKategorierHvisVisningBehandling,
    tilBehandlingstema,
} from '../../../typer/behandlingstema';
import type { IMinimalFagsak } from '../../../typer/fagsak';
import { Klagebehandlingstype } from '../../../typer/klage';
import { Tilbakekrevingsbehandlingstype } from '../../../typer/tilbakekrevingsbehandling';
import { datoformat, formaterIsoDato } from '../../../utils/formatter';
import type { Saksoversiktsbehanlding } from './Behandlinger';
import { hentBehandlingId, hentOpprettetTidspunkt, Saksoversiktstype } from './Behandlinger';

interface IBehandlingshistorikkProps {
    minimalFagsak: IMinimalFagsak;
    saksoversiktsbehandling: Saksoversiktsbehanlding;
}

const lagLenkePåType = (fagsakId: number, behanlding: Saksoversiktsbehanlding): ReactNode => {
    if (behanlding.status === BehandlingStatus.AVSLUTTET) {
        const behandlingstype = behanlding.type;
        return behandlingstyper[behandlingstype].navn;
    }

    switch (behanlding.saksoversiktstype) {
        case Saksoversiktstype.KONTANTSTØTTE:
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

const lagLenkePåResultat = (
    minimalFagsak: IMinimalFagsak,
    behandling: Saksoversiktsbehanlding
): ReactNode => {
    if (!behandling.resultat) {
        return '-';
    }
    switch (behandling.saksoversiktstype) {
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
        case Saksoversiktstype.KONTANTSTØTTE:
            if (behandling.status === BehandlingStatus.AVSLUTTET) {
                return (
                    <Link href={`/fagsak/${minimalFagsak.id}/${behandling.behandlingId}`}>
                        {behandling ? behandlingsresultater[behandling.resultat] : '-'}
                    </Link>
                );
            } else {
                return behandlingsresultater[behandling.resultat];
            }
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

const finnÅrsak = (saksoversikstbehandling: Saksoversiktsbehanlding): ReactNode => {
    if (
        saksoversikstbehandling.saksoversiktstype === Saksoversiktstype.TIlBAKEBETALING &&
        saksoversikstbehandling.type === Tilbakekrevingsbehandlingstype.TILBAKEKREVING
    ) {
        return 'Feilutbetaling';
    }
    return saksoversikstbehandling.årsak ? behandlingÅrsak[saksoversikstbehandling.årsak] : '-';
};

export const Behandling: React.FC<IBehandlingshistorikkProps> = ({
    saksoversiktsbehandling,
    minimalFagsak,
}) => {
    const kategori = hentKategorierHvisVisningBehandling(saksoversiktsbehandling);

    const behandlingstema: IBehandlingstema | undefined = kategori
        ? tilBehandlingstema(kategori)
        : undefined;
    return (
        <tr key={hentBehandlingId(saksoversiktsbehandling)}>
            <td
                children={`${formaterIsoDato(
                    hentOpprettetTidspunkt(saksoversiktsbehandling),
                    datoformat.DATO
                )}`}
            />
            <td>{finnÅrsak(saksoversiktsbehandling)}</td>
            <td>{lagLenkePåType(minimalFagsak.id, saksoversiktsbehandling)}</td>
            <td>{behandlingstema ? behandlingstema.navn : '-'}</td>
            <td>{behandlingsstatuser[saksoversiktsbehandling.status]}</td>
            <td
                children={
                    saksoversiktsbehandling.vedtaksdato
                        ? formaterIsoDato(saksoversiktsbehandling.vedtaksdato, datoformat.DATO)
                        : '-'
                }
            />
            <td>{lagLenkePåResultat(minimalFagsak, saksoversiktsbehandling)}</td>
        </tr>
    );
};
