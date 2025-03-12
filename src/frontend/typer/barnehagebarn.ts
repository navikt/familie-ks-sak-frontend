export interface IBarnehagebarnRequestParams extends IBarnehagebarnFilter {
    ident?: string;
    kommuneNavn?: string;
    kunLøpendeFagsak: boolean;
    limit?: number;
    offset?: number;
    sortBy: string;
    sortAsc: boolean;
}

export interface IBarnehagebarnFilter {
    ident?: string;
    kommuneNavn?: string;
    kunLøpendeFagsak: boolean;
}

export interface IBarnehagebarn {
    ident: string;
    fom: string;
    tom?: string;
    antallTimerIBarnehage?: number;
    endringstype: string;
    kommuneNavn: string;
    kommuneNr: string;
    fagsakId?: number;
    fagsakstatus?: string;
    endretTid: string;
}

export interface IBarnehagebarnInfotrygd {
    ident: string;
    fom: string;
    tom?: string;
    antallTimerIBarnehage?: number;
    endringstype: string;
    kommuneNavn: string;
    kommuneNr: string;
    harFagsak?: boolean;
    endretTid: string;
}

interface ISort {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
}
interface IPageable {
    sort: ISort;
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: false;
}
export interface IBarnehagebarnResponse<T> {
    content: T[];
    pageable: IPageable;
    sort: ISort;
    last: boolean;
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

export type IBarnehagekommune = string;
