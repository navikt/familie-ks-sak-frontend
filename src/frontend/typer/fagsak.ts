import type { VisningBehandling } from '@sider/Fagsak/Saksoversikt/visningBehandling';
import type { BehandlingKategori } from './behandlingstema';
import { type Brand, lagBrandedIdFactory } from './brand';
import type { INøkkelPar } from './common';
import type { Utbetalingsperiode } from './utbetalingsperiode';

// Enum
export enum FagsakStatus {
    OPPRETTET = 'OPPRETTET',
    LØPENDE = 'LØPENDE',
    AVSLUTTET = 'AVSLUTTET',
    LÅST = 'LÅST',
}

export type FagsakId = Brand<number, 'FagsakId'>;
export const FagsakId = lagBrandedIdFactory('FagsakId');

// Interface
interface IBaseFagsak {
    id: FagsakId;
    opprettetTidspunkt: string;
    saksnummer: string;
    status: FagsakStatus;
    søkerFødselsnummer: string;
    underBehandling: boolean;
    løpendeKategori?: BehandlingKategori;
    låstTidspunkt?: string;
}

export interface IMinimalFagsak extends IBaseFagsak {
    behandlinger: VisningBehandling[];
    gjeldendeUtbetalingsperioder: Utbetalingsperiode[];
    finnesStrengtFortroligPersonIFagsak: boolean;
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
    LÅST: {
        id: 'LÅST',
        navn: 'Låst',
    },
};
