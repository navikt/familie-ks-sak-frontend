export interface BarnehagebarnRequestParams extends BarnehagebarnFilter {
    limit?: number;
    offset?: number;
    sortBy: string;
    sortAsc: boolean;
}

export interface BarnehagebarnFilter {
    ident?: string;
    kommuneNavn?: string;
    kunLøpendeAndel: boolean;
}

export interface Barnehagebarn {
    ident: string;
    fom: string;
    tom?: string;
    antallTimerIBarnehage?: number;
    endringstype: string;
    avvik?: boolean;
    kommuneNavn: string;
    kommuneNr: string;
    fagsakId?: number;
    fagsakstatus?: string;
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
export interface BarnehagebarnResponse {
    content: Barnehagebarn[];
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

export type Barnehagekommune = string;
