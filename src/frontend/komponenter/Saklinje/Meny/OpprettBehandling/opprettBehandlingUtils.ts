import type { VisningBehandling } from '../../../../sider/Fagsak/Saksoversikt/visningBehandling';
import { BehandlingStatus, erBehandlingHenlagt } from '../../../../typer/behandling';
import type { IMinimalFagsak } from '../../../../typer/fagsak';
import { FagsakStatus } from '../../../../typer/fagsak';

const kanOppretteNyBehandling = (aktivBehandling: VisningBehandling | undefined) =>
    !aktivBehandling || aktivBehandling?.status === BehandlingStatus.AVSLUTTET;

export const kanOppretteFørstegangsbehandling = (
    minimalFagsak: IMinimalFagsak | undefined,
    aktivBehandling: VisningBehandling | undefined
) => !minimalFagsak || (minimalFagsak.status !== FagsakStatus.LØPENDE && kanOppretteNyBehandling(aktivBehandling));

export const kanOppretteRevurdering = (
    minimalFagsak: IMinimalFagsak | undefined,
    aktivBehandling: VisningBehandling | undefined
) => {
    const alleBehandlingerErHenlagt = minimalFagsak?.behandlinger.every(behandling =>
        erBehandlingHenlagt(behandling.resultat)
    );

    return minimalFagsak && !alleBehandlingerErHenlagt && kanOppretteNyBehandling(aktivBehandling);
};
