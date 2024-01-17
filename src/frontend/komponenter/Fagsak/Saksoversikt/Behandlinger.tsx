import React, { useState } from 'react';

import { differenceInMilliseconds } from 'date-fns';
import styled from 'styled-components';

import { BodyShort, Heading, Switch, Table } from '@navikt/ds-react';

import { Behandling } from './Behandling';
import type { Saksoversiktsbehandling } from './utils';
import {
    hentBehandlingerTilSaksoversikten,
    hentBehandlingId,
    hentOpprettetTidspunkt,
    skalRadVises,
} from './utils';
import { useFagsakContext } from '../../../context/fagsak/FagsakContext';
import type { IMinimalFagsak } from '../../../typer/fagsak';
import { isoStringTilDate } from '../../../utils/dato';

const SwitchHøyre = styled(Switch)`
    margin-top: 1rem;
    margin-right: 0.275rem;
    float: right;
`;

const StyledHeading = styled(Heading)`
    margin-top: 3.75rem;
`;

const StyledOpprettetKolonne = styled(Table.HeaderCell)`
    width: 10%;
`;

const StyledResultatKolonne = styled(Table.HeaderCell)`
    width: 22%;
`;

interface IBehandlingshistorikkProps {
    minimalFagsak: IMinimalFagsak;
}

const Behandlinger: React.FC<IBehandlingshistorikkProps> = ({ minimalFagsak }) => {
    const { klagebehandlinger } = useFagsakContext();

    const behandlinger = hentBehandlingerTilSaksoversikten(minimalFagsak, klagebehandlinger);

    const finnesRadSomKanFiltreresBort = behandlinger.some(
        (behandling: Saksoversiktsbehandling) => !skalRadVises(behandling, false)
    );

    const [visHenlagteBehandlinger, setVisHenlagteBehandlinger] = useState(false);

    return (
        <div className={'saksoversikt__behandlingshistorikk'}>
            <StyledHeading level="2" size={'medium'} children={'Behandlinger'} spacing />
            {behandlinger.length > 0 ? (
                <Table size={'large'}>
                    <Table.Header>
                        <Table.Row>
                            <StyledOpprettetKolonne children={'Opprettet'} />
                            <Table.HeaderCell children={'Årsak'} />
                            <Table.HeaderCell children={'Type'} />
                            <Table.HeaderCell children={'Behandlingstema'} />
                            <Table.HeaderCell children={'Status'} />
                            <Table.HeaderCell children={'Vedtaksdato'} />
                            <StyledResultatKolonne children={'Resultat'} />
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {behandlinger
                            .filter(behandling => skalRadVises(behandling, visHenlagteBehandlinger))
                            .sort((a, b) =>
                                differenceInMilliseconds(
                                    isoStringTilDate(hentOpprettetTidspunkt(b)),
                                    isoStringTilDate(hentOpprettetTidspunkt(a))
                                )
                            )
                            .map((behandling: Saksoversiktsbehandling) => (
                                <Behandling
                                    key={hentBehandlingId(behandling)}
                                    saksoversiktsbehandling={behandling}
                                    minimalFagsak={minimalFagsak}
                                />
                            ))}
                    </Table.Body>
                </Table>
            ) : (
                <BodyShort children={'Ingen tidligere behandlinger'} />
            )}
            {finnesRadSomKanFiltreresBort && (
                <SwitchHøyre
                    size="small"
                    position="left"
                    id={'vis-henlagte-behandlinger'}
                    checked={visHenlagteBehandlinger}
                    onChange={() => {
                        setVisHenlagteBehandlinger(!visHenlagteBehandlinger);
                    }}
                >
                    Vis henlagte behandlinger
                </SwitchHøyre>
            )}
        </div>
    );
};

export default Behandlinger;
