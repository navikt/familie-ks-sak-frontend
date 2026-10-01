import { useFeatureToggles } from '@hooks/useFeatureToggles';
import { Heading, Table } from '@navikt/ds-react';
import { FeatureToggle } from '@typer/featureToggles';
import styled from 'styled-components';
import type { IBehandling } from '../../../../../../typer/behandling';
import { EndretUtbetalingAndelProvider } from './EndretUtbetalingAndelContext';
import EndretUtbetalingAndelRad from './EndretUtbetalingAndelRad';
import { EndretUtbetalingAndelRadNy } from './EndretUtbetalingAndelRadNy';

interface IEndretUtbetalingAndelTabellProps {
    åpenBehandling: IBehandling;
}

const EndredePerioder = styled.div`
    margin-top: 6rem;
`;

const EndretUtbetalingAndelTabell = ({ åpenBehandling }: IEndretUtbetalingAndelTabellProps) => {
    const endretUtbetalingAndeler = åpenBehandling.endretUtbetalingAndeler;
    const featureToggles = useFeatureToggles();
    const brukNyttSkjema = featureToggles[FeatureToggle.brukNyttEndretUtbetalingAndelSkjema];

    return (
        <EndredePerioder>
            <Heading spacing size="medium" level="3">
                Endrede utbetalingsperioder
            </Heading>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell scope="col">Person</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Årsak</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Utbetales</Table.HeaderCell>
                        <Table.HeaderCell scope="col" />
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {brukNyttSkjema
                        ? endretUtbetalingAndeler.map(endretUtbetalingAndel => (
                              <EndretUtbetalingAndelProvider
                                  endretUtbetalingAndel={endretUtbetalingAndel}
                                  key={endretUtbetalingAndel.id}
                              >
                                  <EndretUtbetalingAndelRadNy />
                              </EndretUtbetalingAndelProvider>
                          ))
                        : endretUtbetalingAndeler.map(endretUtbetalingAndel => (
                              <EndretUtbetalingAndelRad
                                  lagretEndretUtbetalingAndel={endretUtbetalingAndel}
                                  åpenBehandling={åpenBehandling}
                                  key={endretUtbetalingAndel.id}
                              />
                          ))}
                </Table.Body>
            </Table>
        </EndredePerioder>
    );
};

export default EndretUtbetalingAndelTabell;
