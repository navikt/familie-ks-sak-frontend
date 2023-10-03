import React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';

import { Alert, Table } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import BarnehagebarnInfotrygdListNavigator from './BarnehagebarnInfotrygdListNavigator';
import BarnehagebarnInfotrygdSortLink from './BarnehagebarnInfotrygdSortLink';
import { useBarnehagebarnInfotrygd } from '../../../context/BarnehagebarnInfotrygdContext';

const StyledAlert = styled(Alert)`
    margin-top: 1rem;
`;

const StyledTable = styled(Table)`
    th + th {
        border-left: 1px solid var(--ac-table-row-border, ${navFarger.navGra20});
    }
    th {
        border-bottom: 1px solid var(--ac-table-row-border, ${navFarger.navGra20});
    }
    td + td {
        border-left: 1px solid var(--ac-table-row-border, ${navFarger.navGra40});
    }
`;

const BarnehagebarnInfortrygdList: React.FunctionComponent = () => {
    const { barnehagebarnResponse, data } = useBarnehagebarnInfotrygd();

    return (
        <div className={'barnehagebarnList'}>
            <div>
                <BarnehagebarnInfotrygdListNavigator />
            </div>
            <div>
                <StyledTable zebraStripes={true} size="small">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell scope="col">
                                <BarnehagebarnInfotrygdSortLink
                                    displayValue={'Barns ident'}
                                    fieldName={'ident'}
                                />
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">
                                <BarnehagebarnInfotrygdSortLink
                                    displayValue={'Fra og med'}
                                    fieldName={'fom'}
                                />
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">
                                <BarnehagebarnInfotrygdSortLink
                                    displayValue={'Til og med'}
                                    fieldName={'tom'}
                                />
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">
                                <BarnehagebarnInfotrygdSortLink
                                    displayValue={'Ant. timer i barnehage'}
                                    fieldName={'antallTimerIBarnehage'}
                                />
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">
                                <BarnehagebarnInfotrygdSortLink
                                    displayValue={'Endringstype'}
                                    fieldName={'endringstype'}
                                />
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">
                                <BarnehagebarnInfotrygdSortLink
                                    displayValue={'Kommunenavn'}
                                    fieldName={'kommuneNavn'}
                                />
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">
                                <BarnehagebarnInfotrygdSortLink
                                    displayValue={'Kommunenr.'}
                                    fieldName={'kommuneNr'}
                                />
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">
                                <span>Har fagsak Infotrygd</span>
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {data.map((barnheagebarn, i) => {
                            return (
                                <Table.Row key={i + barnheagebarn.ident}>
                                    <Table.DataCell>{barnheagebarn.ident}</Table.DataCell>
                                    <Table.DataCell>{barnheagebarn.fom}</Table.DataCell>
                                    <Table.DataCell>{barnheagebarn.tom}</Table.DataCell>
                                    <Table.DataCell align="right">
                                        {barnheagebarn.antallTimerIBarnehage}
                                    </Table.DataCell>
                                    <Table.DataCell>{barnheagebarn.endringstype}</Table.DataCell>
                                    <Table.DataCell>{barnheagebarn.kommuneNavn}</Table.DataCell>
                                    <Table.DataCell>{barnheagebarn.kommuneNr}</Table.DataCell>
                                    <Table.DataCell>
                                        {barnheagebarn.harFagsak ? (
                                            <span>Ja</span>
                                        ) : (
                                            <span>Nei</span>
                                        )}
                                    </Table.DataCell>
                                </Table.Row>
                            );
                        })}
                    </Table.Body>
                </StyledTable>
            </div>

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
        </div>
    );
};
export default BarnehagebarnInfortrygdList;
