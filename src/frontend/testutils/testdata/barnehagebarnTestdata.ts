import type { Barnehagebarn, BarnehagebarnResponse } from '../../typer/barnehagebarn';

export function lagBarnehagebarn(barnehagebarn: Partial<Barnehagebarn> = {}): Barnehagebarn {
    return {
        ident: '10022412345',
        fom: '2025-08-01',
        tom: undefined,
        antallTimerIBarnehage: 20,
        endringstype: 'NY',
        avvik: false,
        kommuneNavn: 'Oslo',
        kommuneNr: '0301',
        fagsakId: 1,
        fagsakstatus: 'LØPENDE',
        endretTid: '2025-08-15T10:00:00.000',
        ...barnehagebarn,
    };
}

export function lagBarnehagebarnResponse(
    barnehagebarn: Barnehagebarn[] = [lagBarnehagebarn()],
    { side = 0, antallPerSide = 20 }: { side?: number; antallPerSide?: number } = {}
): BarnehagebarnResponse {
    const sort = { empty: true, sorted: false, unsorted: true };
    const totalPages = Math.max(1, Math.ceil(barnehagebarn.length / antallPerSide));
    return {
        content: barnehagebarn,
        pageable: {
            sort,
            offset: side * antallPerSide,
            pageNumber: side,
            pageSize: antallPerSide,
            paged: true,
            unpaged: false,
        },
        sort,
        last: side === totalPages - 1,
        totalElements: barnehagebarn.length,
        totalPages,
        number: side,
        size: antallPerSide,
        first: side === 0,
        numberOfElements: barnehagebarn.length,
        empty: barnehagebarn.length === 0,
    };
}

export * as BarnehagebarnTestdata from './barnehagebarnTestdata';
