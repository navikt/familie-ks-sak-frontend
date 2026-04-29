import type { VisningBehandling } from '../../../sider/Fagsak/Saksoversikt/visningBehandling';
import { lagVisningBehandling } from '../../../testutils/testdata/behandlingTestdata';
import { BehandlingKategori } from '../../../typer/behandlingstema';
import type { IMinimalFagsak } from '../../../typer/fagsak';
import { FagsakStatus } from '../../../typer/fagsak';
import type { Utbetalingsperiode } from '../../../typer/utbetalingsperiode';

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
    finnesStrengtFortroligPersonIFagsak?: boolean;
}

export const mockMinimalFagsak = ({
    behandlinger = [lagVisningBehandling()],
    gjeldendeUtbetalingsperioder = [],
    id = 1,
    opprettetTidspunkt = '2020-09-19T09:08:56.8',
    saksnummer = '1234',
    status = FagsakStatus.LØPENDE,
    søkerFødselsnummer = '12345678910',
    underBehandling = false,
    løpendeKategori = BehandlingKategori.NASJONAL,
    finnesStrengtFortroligPersonIFagsak = false,
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
    finnesStrengtFortroligPersonIFagsak,
});
