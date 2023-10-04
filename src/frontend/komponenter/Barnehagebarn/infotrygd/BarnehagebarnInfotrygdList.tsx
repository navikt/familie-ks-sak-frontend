import React from 'react';

import styled from 'styled-components';

import { Alert, Table } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import { useBarnehagebarnInfotrygd } from '../../../context/BarnehagebarnInfotrygdContext';

const StyledAlert = styled(Alert)`
    margin-top: 1rem;
`;

const BarnehagebarnInfotrygdList: React.FunctionComponent = () => {
    const { barnehagebarnResponse, data, barnehagebarnRequestParams, updateSortByAscDesc } =
        useBarnehagebarnInfotrygd();

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
                        <Table.ColumnHeader sortable sortKey={'kommuneNavn'}>
                            Kommunenavn
                        </Table.ColumnHeader>
                        <Table.ColumnHeader sortable sortKey={'kommuneNr'}>
                            Kommunenr.
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>Har fagsak Infotrygd</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data.map((barnehagebarn, i) => {
                        return (
                            <Table.Row key={i + barnehagebarn.ident}>
                                <Table.DataCell>{barnehagebarn.ident}</Table.DataCell>
                                <Table.DataCell>{barnehagebarn.fom}</Table.DataCell>
                                <Table.DataCell>{barnehagebarn.tom}</Table.DataCell>
                                <Table.DataCell align="right">
                                    {barnehagebarn.antallTimerIBarnehage}
                                </Table.DataCell>
                                <Table.DataCell>{barnehagebarn.endringstype}</Table.DataCell>
                                <Table.DataCell>{barnehagebarn.kommuneNavn}</Table.DataCell>
                                <Table.DataCell>{barnehagebarn.kommuneNr}</Table.DataCell>
                                <Table.DataCell>
                                    {barnehagebarn.harFagsak ? 'Ja' : 'Nei'}
                                </Table.DataCell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table>

            {barnehagebarnResponse.status === RessursStatus.SUKSESS &&
                barnehagebarnResponse.data.content.length === 0 && (
                    <StyledAlert variant="warning">Ingen barnehagebarn (ev tøm filter)</StyledAlert>
                )}
            {(barnehagebarnResponse.status === RessursStatus.FEILET ||
                barnehagebarnResponse.status === RessursStatus.FUNKSJONELL_FEIL ||
                barnehagebarnResponse.status === RessursStatus.IKKE_TILGANG) && (
                <StyledAlert variant="error">
                    {barnehagebarnResponse.frontendFeilmelding}
                </StyledAlert>
            )}
            {barnehagebarnResponse.status === RessursStatus.HENTER && (
                <StyledAlert variant="info">Henter...</StyledAlert>
            )}
        </>
    );
};
export default BarnehagebarnInfotrygdList;
