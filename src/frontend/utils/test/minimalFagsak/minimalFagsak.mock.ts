import type { VisningBehandling } from '../../../sider/Fagsak/Saksoversikt/visningBehandling';
import { BehandlingKategori } from '../../../typer/behandlingstema';
import type { IMinimalFagsak } from '../../../typer/fagsak';
import { FagsakStatus } from '../../../typer/fagsak';
import type { Utbetalingsperiode } from '../../../typer/utbetalingsperiode';
import { mockVisningBehandling } from '../behandling/behandling.mock';

interface IMockMinimalFagsak {
    behandlinger?: VisningBehandling[];
    gjeldendeUtbetalingsperioder?: Utbetalingsperiode[];
    id?: number;
    opprettetTidspunkt?: string;
    saksnummer?: string;
    status?: FagsakStatus;
    søkerFødselsnummer?: string;
    underBehandling?: boolean;
    løpendeKategori?: BehandlingKategori;
}

export const mockMinimalFagsak = ({
    behandlinger = [mockVisningBehandling()],
    gjeldendeUtbetalingsperioder = [],
    id = 1,
    opprettetTidspunkt = '2020-09-19T09:08:56.8',
    saksnummer = '1234',
    status = FagsakStatus.LØPENDE,
    søkerFødselsnummer = '12345678910',
    underBehandling = false,
    løpendeKategori = BehandlingKategori.NASJONAL,
}: IMockMinimalFagsak = {}): IMinimalFagsak => ({
    behandlinger,
    id,
    søkerFødselsnummer,
    opprettetTidspunkt,
    saksnummer,
    status,
    underBehandling,
    gjeldendeUtbetalingsperioder,
    løpendeKategori,
});
