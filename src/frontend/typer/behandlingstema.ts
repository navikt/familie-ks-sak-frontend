import type { IOppgave } from './oppgave';

export enum BehandlingKategori {
    NASJONAL = 'NASJONAL',
    EØS = 'EØS',
}

export enum Behandlingstema {
    NASJONAL = 'NASJONAL',
    EØS = 'EØS',
}

export interface IRestEndreBehandlingstema {
    behandlingKategori: BehandlingKategori;
}
export const behandlingKategori: Record<BehandlingKategori, string> = {
    NASJONAL: 'Nasjonal',
    EØS: 'EØS',
};

export interface IBehandlingstema {
    kategori: BehandlingKategori;
    navn: string;
    id: string;
}

export const behandlingstemaer: Record<Behandlingstema, IBehandlingstema> = {
    NASJONAL: {
        kategori: BehandlingKategori.NASJONAL,
        navn: 'Nasjonal',
        id: 'NASJONAL',
    },
    EØS: {
        kategori: BehandlingKategori.EØS,
        navn: 'EØS',
        id: 'EØS',
    },
};

export const tilBehandlingstema = (kategori: BehandlingKategori): IBehandlingstema | undefined => {
    return Object.values(behandlingstemaer).find(
        (tema: IBehandlingstema) => tema.kategori === kategori
    );
};

export const kodeTilBehandlingKategoriMap: Record<string, BehandlingKategori> = {
    ae0118: BehandlingKategori.NASJONAL,
    ae0120: BehandlingKategori.EØS,
};

export const utredBehandlingstemaFraOppgave = (oppgave: IOppgave): IBehandlingstema | undefined => {
    const { behandlingstype } = oppgave;
    return behandlingstype in kodeTilBehandlingKategoriMap
        ? tilBehandlingstema(kodeTilBehandlingKategoriMap[behandlingstype])
        : undefined;
};
