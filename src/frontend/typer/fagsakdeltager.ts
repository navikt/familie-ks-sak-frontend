import type { Adressebeskyttelsegradering, kjønnType } from '@navikt/familie-typer';

export enum FagsakDeltagerRolle {
    Barn = 'BARN',
    Forelder = 'FORELDER',
    Ukjent = 'UKJENT',
}

export interface IFagsakDeltager {
    navn?: string;
    ident: string;
    rolle: FagsakDeltagerRolle;
    kjønn?: kjønnType;
    fagsakId?: number;
    adressebeskyttelseGradering?: Adressebeskyttelsegradering;
    harTilgang: boolean;
    erEgenAnsatt?: boolean;
}

export interface ISøkParam {
    personIdent: string;
}
