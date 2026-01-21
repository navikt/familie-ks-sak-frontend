import type { BehandlingKategori } from './behandlingstema';
import type { INøkkelPar } from './common';
import type { Utbetalingsperiode } from './utbetalingsperiode';
import type { VisningBehandling } from '../sider/Fagsak/Saksoversikt/visningBehandling';

// Enum
export enum FagsakStatus {
    OPPRETTET = 'OPPRETTET',
    LØPENDE = 'LØPENDE',
    AVSLUTTET = 'AVSLUTTET',
}

// Interface
interface IBaseFagsak {
    id: number;
    opprettetTidspunkt: string;
    saksnummer: string;
    status: FagsakStatus;
    søkerFødselsnummer: string;
    underBehandling: boolean;
    løpendeKategori?: BehandlingKategori;
}

export interface IMinimalFagsak extends IBaseFagsak {
    behandlinger: VisningBehandling[];
    gjeldendeUtbetalingsperioder: Utbetalingsperiode[];
}

export const fagsakStatus: INøkkelPar = {
    OPPRETTET: {
        id: 'OPPRETTET',
        navn: 'Opprettet',
    },
    LØPENDE: {
        id: 'LØPENDE',
        navn: 'Løpende',
    },
    AVSLUTTET: {
        id: 'AVSLUTTET',
        navn: 'Avsluttet',
    },
};
