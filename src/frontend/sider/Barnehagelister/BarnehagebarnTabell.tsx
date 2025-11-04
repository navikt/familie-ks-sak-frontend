import { Link as ReactRouterLink } from 'react-router';

import { Alert, Box, HStack, Link, Loader, Table } from '@navikt/ds-react';

import { useHentBarnehagebarn } from '../../hooks/useHentBarnehagebarn';
import type { BarnehagebarnRequestParams } from '../../typer/barnehagebarn';
import { Datoformat, isoStringTilFormatertString } from '../../utils/dato';

interface BarnehagebarnTabellProps {
    barnehagebarnRequestParams: BarnehagebarnRequestParams;
    updateSortByAscDesc: (fieldName: string) => void;
}

export const BarnehagebarnTabell = (props: BarnehagebarnTabellProps) => {
    const { barnehagebarnRequestParams, updateSortByAscDesc } = props;

    const { data, isPending, error } = useHentBarnehagebarn(barnehagebarnRequestParams);

    function visAvvikstekst(avvik?: boolean) {
        if (avvik === true) {
            return 'Ja';
        } else if (avvik === false) {
            return 'Nei';
        }
        return '-';
    }

    return (
        <>
            <Table
                zebraStripes={true}
                size="small"
                sort={{
                    orderBy: barnehagebarnRequestParams.sortBy,
                    direction: barnehagebarnRequestParams.sortAsc ? 'ascending' : 'descending',
                }}
                onSortChange={sortKey => sortKey && updateSortByAscDesc(sortKey)}
            >
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader sortable sortKey={'ident'}>
                            Barns ident
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey={'endretTid'}>
                            Mottatt tid
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey={'fom'}>
                            Fra og med
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey={'tom'}>
                            Til og med
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey={'antallTimerIBarnehage'}>
                            Ant. timer i barnehage
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey={'endringstype'}>
                            Endringstype
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey={'avvik'}>
                            Avvik
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey={'kommuneNavn'}>
                            Kommunenavn
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey={'kommuneNr'}>
                            Kommunenr.
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>Fagsakstatus</Table.ColumnHeader>
                        <Table.ColumnHeader>Saksoversikt</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {!error &&
                        data?.content.map((barnehagebarn, i) => {
                            return (
                                <Table.Row key={i + barnehagebarn.ident}>
                                    <Table.DataCell>{barnehagebarn.ident}</Table.DataCell>
                                    <Table.DataCell>
                                        {isoStringTilFormatertString({
                                            isoString: barnehagebarn.endretTid,
                                            tilFormat: Datoformat.DATO_TID,
                                        })}
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        {isoStringTilFormatertString({
                                            isoString: barnehagebarn.fom,
                                            tilFormat: Datoformat.DATO_FORKORTTET,
                                        })}
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        {isoStringTilFormatertString({
                                            isoString: barnehagebarn.tom,
                                            tilFormat: Datoformat.DATO_FORKORTTET,
                                        })}
                                    </Table.DataCell>
                                    <Table.DataCell align="center">
                                        {barnehagebarn.antallTimerIBarnehage}
                                    </Table.DataCell>
                                    <Table.DataCell>{barnehagebarn.endringstype}</Table.DataCell>
                                    <Table.DataCell>{visAvvikstekst(barnehagebarn.avvik)}</Table.DataCell>
                                    <Table.DataCell>{barnehagebarn.kommuneNavn}</Table.DataCell>
                                    <Table.DataCell>{barnehagebarn.kommuneNr}</Table.DataCell>
                                    <Table.DataCell>
                                        {barnehagebarn.fagsakstatus ? barnehagebarn.fagsakstatus : 'Ingen fagsak'}
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        {barnehagebarn.fagsakId ? (
                                            <Link
                                                as={ReactRouterLink}
                                                title={`FagsakId: ${barnehagebarn.fagsakId}`}
                                                to={`/fagsak/${barnehagebarn.fagsakId}/saksoversikt`}
                                            >
                                                Gå til saksoversikt
                                            </Link>
                                        ) : (
                                            'Ingen fagsak'
                                        )}
                                    </Table.DataCell>
                                </Table.Row>
                            );
                        })}
                </Table.Body>
            </Table>

            {isPending && (
                <HStack width={'100%'} justify={'center'} align={'center'} margin={'space-16'} gap={'space-6'}>
                    <Loader /> Laster barnehagebarn
                </HStack>
            )}

            {error && (
                <Box margin={'space-8'}>
                    <Alert variant={'error'}>{error.message}</Alert>
                </Box>
            )}

            {!error && data?.content.length === 0 && (
                <Box marginBlock="space-16 0">
                    <Alert variant="warning">Ingen barnehagebarn (ev tøm filter)</Alert>
                </Box>
            )}
        </>
    );
};
