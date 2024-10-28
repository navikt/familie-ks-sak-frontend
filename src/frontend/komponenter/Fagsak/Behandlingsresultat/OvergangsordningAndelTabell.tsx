import * as React from 'react';

import styled from 'styled-components';

import { Heading, Table } from '@navikt/ds-react';

import OvergangsordningAndelRad from './OvergangsordningAndelRad';
import { OvergangsordningAndelProvider } from '../../../context/OvergangsordningAndelContext';
import type { IBehandling } from '../../../typer/behandling';

interface IOvergangsordningTabellProps {
    åpenBehandling: IBehandling;
}

const OvergangsordningPerioder = styled.div`
    margin-top: 6rem;
`;

const OvergangsordningAndelTabell: React.FunctionComponent<IOvergangsordningTabellProps> = ({
    åpenBehandling,
}) => {
    const overgangsordningAndeler = åpenBehandling.overgangsordningAndeler;

    return (
        <OvergangsordningPerioder>
            <Heading spacing size="medium" level="3">
                Overgangsordning
            </Heading>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell scope="col">Person</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Antall timer</Table.HeaderCell>
                        <Table.HeaderCell scope="col" />
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {overgangsordningAndeler.map(overgangsordningAndel => (
                        <OvergangsordningAndelProvider
                            overgangsordningAndel={overgangsordningAndel}
                            key={overgangsordningAndel.id}
                        >
                            <OvergangsordningAndelRad
                                overgangsordningAndel={overgangsordningAndel}
                                åpenBehandling={åpenBehandling}
                            />
                        </OvergangsordningAndelProvider>
                    ))}
                </Table.Body>
            </Table>
        </OvergangsordningPerioder>
    );
};

export default OvergangsordningAndelTabell;
