import { lagVisningBehandling } from '../../../testutils/testdata/behandlingTestdata';
import { BehandlingKategori } from '../../../typer/behandlingstema';
import type { IMinimalFagsak } from '../../../typer/fagsak';
import { FagsakStatus } from '../../../typer/fagsak';

// Tar Partial<IMinimalFagsak> framfor et håndskrevet interface, slik at nye felter
// på IMinimalFagsak blir tilgjengelige her uten at builderen må vedlikeholdes.
export const mockMinimalFagsak = (overstyringer: Partial<IMinimalFagsak> = {}): IMinimalFagsak => ({
    behandlinger: [lagVisningBehandling()],
    id: 1,
    søkerFødselsnummer: '12345678910',
    opprettetTidspunkt: '2020-09-19T09:08:56.8',
    saksnummer: '1234',
    status: FagsakStatus.LØPENDE,
    underBehandling: false,
    gjeldendeUtbetalingsperioder: [],
    løpendeKategori: BehandlingKategori.NASJONAL,
    finnesStrengtFortroligPersonIFagsak: false,
    ...overstyringer,
});
