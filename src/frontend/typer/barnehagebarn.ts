export interface IBarnehagebarnRequestParams {
    ident?: string;
    fom?: string;
    tom?: string;
    endringstype?: string;
    kommuneNavn?: string;
    kommuneNr?: string;
    antallTimerIBarnehage?: number;
    kunLøpendeFagsak: boolean;
    limit?: number;
    offset?: number;
    sortBy: string;
    sortAsc: boolean;
}
export interface IBarnehagebarn {
    id: string;
    ident: string;
    fom: string;
    tom?: string;
    antallTimerIBarnehage?: number;
    endringstype: string;
    kommuneNavn: string;
    kommuneNr: string;
    versjon: number;
    opprettetAv: string;
    opprettetTidspunkt: string;
    endretAv: string;
    endretTidspunkt: string;
    fagsakId: number;
    behandlingId: number;
    fagsakstatus: string;
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
