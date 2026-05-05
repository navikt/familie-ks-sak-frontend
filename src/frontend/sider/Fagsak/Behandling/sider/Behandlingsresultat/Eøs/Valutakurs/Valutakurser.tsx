import styled from 'styled-components';

import { Box, Heading, LocalAlert, Table } from '@navikt/ds-react';

import ValutakursTabellRad from './ValutakursTabellRad';
import { BehandlingÅrsak, type IBehandling } from '../../../../../../../typer/behandling';
import type { IRestValutakurs } from '../../../../../../../typer/eøsPerioder';

const ValutakurserContainer = styled.div`
    margin-top: 5rem;
`;

const StyledTable = styled(Table)`
    margin-top: 2rem;
`;

const StyledHeaderCell = styled(Table.HeaderCell)`
    &:nth-of-type(2) {
        width: 11rem;
    }

    &:nth-of-type(3) {
        width: 7.5rem;
    }

    &:nth-of-type(4) {
        width: 14rem;
    }

    &:nth-of-type(5) {
        width: 2.25rem;
    }
`;

interface IProps {
    valutakurser: IRestValutakurs[];
    erValutakurserGyldige: () => boolean;
    åpenBehandling: IBehandling;
    visFeilmeldinger: boolean;
}

const Valutakurser = ({ valutakurser, erValutakurserGyldige, åpenBehandling, visFeilmeldinger }: IProps) => {
    return (
        <ValutakurserContainer>
            <Heading spacing size="medium" level="3">
                Valuta
            </Heading>
            {åpenBehandling.årsak == BehandlingÅrsak.OVERGANGSORDNING_2024 && (
                <Box marginBlock={'space-0 space-8'}>
                    <LocalAlert status="warning">
                        <LocalAlert.Header>
                            <LocalAlert.Title>
                                For EØS-perioder med overgangsordning skal valutakursdato være 29.11.2024
                            </LocalAlert.Title>
                        </LocalAlert.Header>
                    </LocalAlert>
                </Box>
            )}
            {!erValutakurserGyldige() && (
                <LocalAlert status="warning">
                    <LocalAlert.Header>
                        <LocalAlert.Title>
                            For perioder som skal differanseberegnes, må valutakursdato registeres
                        </LocalAlert.Title>
                    </LocalAlert.Header>
                </LocalAlert>
            )}
            <StyledTable>
                <Table.Header>
                    <Table.Row>
                        <StyledHeaderCell scope="col">Barn</StyledHeaderCell>
                        <StyledHeaderCell scope="col">Periode</StyledHeaderCell>
                        <StyledHeaderCell scope="col">Valutakursdato</StyledHeaderCell>
                        <StyledHeaderCell scope="col">Valuta</StyledHeaderCell>
                        <StyledHeaderCell></StyledHeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {valutakurser.map(valutakurs => (
                        <ValutakursTabellRad
                            key={`${valutakurs.barnIdenter.map(barn => `${barn}-`)}-${
                                valutakurs.fom
                            }-${valutakurs.tom}`}
                            valutakurs={valutakurs}
                            åpenBehandling={åpenBehandling}
                            visFeilmeldinger={visFeilmeldinger}
                        />
                    ))}
                </Table.Body>
            </StyledTable>
        </ValutakurserContainer>
    );
};

export default Valutakurser;
