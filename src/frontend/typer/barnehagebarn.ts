export interface IBarnehagebarnRequestParams {
    ident?: string;
    kommuneNavn?: string;
    kunLøpendeFagsak: boolean;
    limit?: number;
    offset?: number;
    sortBy: string;
    sortAsc: boolean;
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

export interface ISort {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
}
export interface IPageable {
    sort: ISort;
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: false;
}
export interface IBarnehagebarnResponse {
    content: IBarnehagebarn[];
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

export interface IBarnehagebarnInfotrygdResponse {
    content: IBarnehagebarnInfotrygd[];
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
