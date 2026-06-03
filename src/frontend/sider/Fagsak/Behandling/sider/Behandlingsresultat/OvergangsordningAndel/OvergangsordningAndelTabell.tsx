import type { IBehandling } from '@typer/behandling';

import { Box, Heading, Table } from '@navikt/ds-react';

import { OvergangsordningAndelProvider } from './OvergangsordningAndelContext';
import OvergangsordningAndelRad from './OvergangsordningAndelRad';

interface IOvergangsordningTabellProps {
    åpenBehandling: IBehandling;
}

const OvergangsordningAndelTabell = ({ åpenBehandling }: IOvergangsordningTabellProps) => {
    const overgangsordningAndeler = åpenBehandling.overgangsordningAndeler;

    return (
        <Box marginBlock={'space-96'}>
            <Heading spacing size="medium" level="3">
                Overgangsordning
            </Heading>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell scope="col">Person</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Antall timer i barnehage</Table.HeaderCell>
                        <Table.HeaderCell scope="col" />
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {overgangsordningAndeler.map(overgangsordningAndel => (
                        <OvergangsordningAndelProvider
                            overgangsordningAndel={overgangsordningAndel}
                            key={overgangsordningAndel.id}
                        >
                            <OvergangsordningAndelRad åpenBehandling={åpenBehandling} />
                        </OvergangsordningAndelProvider>
                    ))}
                </Table.Body>
            </Table>
        </Box>
    );
};

export default OvergangsordningAndelTabell;
