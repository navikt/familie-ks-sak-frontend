import React from 'react';

import type { Saksoversiktsbehandling } from './utils';
import {
    finnÅrsak,
    hentBehandlingId,
    hentBehandlingstema,
    hentOpprettetTidspunkt,
    lagLenkePåResultat,
    lagLenkePåType,
} from './utils';
import { behandlingsstatuser } from '../../../typer/behandling';
import type { IMinimalFagsak } from '../../../typer/fagsak';
import { Datoformat, isoStringTilFormatertString } from '../../../utils/dato';

interface IBehandlingshistorikkProps {
    minimalFagsak: IMinimalFagsak;
    saksoversiktsbehandling: Saksoversiktsbehandling;
}

export const Behandling: React.FC<IBehandlingshistorikkProps> = ({
    saksoversiktsbehandling,
    minimalFagsak,
}) => {
    return (
        <tr key={hentBehandlingId(saksoversiktsbehandling)}>
            <td
                children={`${isoStringTilFormatertString({
                    isoString: hentOpprettetTidspunkt(saksoversiktsbehandling),
                    tilFormat: Datoformat.DATO,
                })}`}
            />
            <td>{finnÅrsak(saksoversiktsbehandling)}</td>
            <td>{lagLenkePåType(minimalFagsak.id, saksoversiktsbehandling)}</td>
            <td>{hentBehandlingstema(saksoversiktsbehandling)?.navn ?? '-'}</td>
            <td>{behandlingsstatuser[saksoversiktsbehandling.status]}</td>
            <td
                children={isoStringTilFormatertString({
                    isoString: saksoversiktsbehandling.vedtaksdato,
                    tilFormat: Datoformat.DATO,
                    defaultString: '-',
                })}
            />
            <td>{lagLenkePåResultat(minimalFagsak, saksoversiktsbehandling)}</td>
        </tr>
    );
};
