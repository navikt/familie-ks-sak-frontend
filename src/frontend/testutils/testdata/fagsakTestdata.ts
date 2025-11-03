import { FagsakStatus, type IMinimalFagsak } from '../../typer/fagsak';

export function lagFagsak(fagsak?: Partial<IMinimalFagsak>): IMinimalFagsak {
    return {
        id: 1,
        opprettetTidspunkt: 'string',
        saksnummer: '1234',
        status: FagsakStatus.OPPRETTET,
        søkerFødselsnummer: '12345678903',
        underBehandling: false,
        løpendeKategori: undefined,
        behandlinger: [],
        gjeldendeUtbetalingsperioder: [],
        ...fagsak,
    };
}

export * as FagsakTestdata from './fagsakTestdata';
