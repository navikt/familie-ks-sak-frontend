import { Box, Heading, LocalAlert, Table } from '@navikt/ds-react';
import { BehandlingÅrsak, type IBehandling } from '@typer/behandling';
import type { IRestValutakurs } from '@typer/eøsPerioder';
import Styles from './Valutakurser.module.css';
import ValutakursTabellRad from './ValutakursTabellRad';

interface IProps {
    valutakurser: IRestValutakurs[];
    erValutakurserGyldige: () => boolean;
    åpenBehandling: IBehandling;
    visFeilmeldinger: boolean;
}

const Valutakurser = ({ valutakurser, erValutakurserGyldige, åpenBehandling, visFeilmeldinger }: IProps) => {
    return (
        <Box marginBlock={'space-80 space-0'}>
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
            <Table className={Styles.table}>
                <Table.Header>
                    <Table.Row className={Styles.headerRow}>
                        <Table.HeaderCell scope="col">Barn</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Valutakursdato</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Valuta</Table.HeaderCell>
                        <Table.HeaderCell></Table.HeaderCell>
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
            </Table>
        </Box>
    );
};

export default Valutakurser;
