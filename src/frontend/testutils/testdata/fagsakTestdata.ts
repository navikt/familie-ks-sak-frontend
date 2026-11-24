import type { NoBrand } from '@typer/brand';
import { FagsakId, FagsakStatus, type IMinimalFagsak } from '@typer/fagsak';

export function lagFagsak(fagsak: Partial<NoBrand<IMinimalFagsak>> = {}): IMinimalFagsak {
    const { id = 1, ...resten } = fagsak;
    return {
        opprettetTidspunkt: 'string',
        saksnummer: '1234',
        status: FagsakStatus.OPPRETTET,
        søkerFødselsnummer: '12345678903',
        underBehandling: false,
        løpendeKategori: undefined,
        behandlinger: [],
        gjeldendeUtbetalingsperioder: [],
        finnesStrengtFortroligPersonIFagsak: false,
        ...resten,
        id: FagsakId.fra(id),
    };
}

export * as FagsakTestdata from './fagsakTestdata';
