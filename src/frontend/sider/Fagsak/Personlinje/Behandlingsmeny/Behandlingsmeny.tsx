import React from 'react';

import styled from 'styled-components';

import { ChevronDownIcon } from '@navikt/aksel-icons';
import { Button, Dropdown } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import MenyvalgFagsak from './MenyvalgFagsak';
import MenyvalgBehandling from './OpprettFagsak/MenyvalgBehandling';
import { useBehandlingContext } from '../../../../context/behandlingContext/BehandlingContext';
import { BehandlingStatus } from '../../../../typer/behandling';
import type { IMinimalFagsak } from '../../../../typer/fagsak';

interface IProps {
    minimalFagsak: IMinimalFagsak;
}

const PosisjonertMenyknapp = styled(Button)`
    margin-left: 3rem;
`;

const StyledDropdownMenu = styled(Dropdown.Menu)`
    width: 30ch;
`;

const Behandlingsmeny: React.FC<IProps> = ({ minimalFagsak }) => {
    const { åpenBehandling } = useBehandlingContext();

    const skalViseMenyvalgForBehandling =
        åpenBehandling.status === RessursStatus.SUKSESS &&
        åpenBehandling.data.status !== BehandlingStatus.AVSLUTTET;

    return (
        <Dropdown>
            <PosisjonertMenyknapp
                variant="secondary"
                size="small"
                icon={<ChevronDownIcon />}
                iconPosition={'right'}
                forwardedAs={Dropdown.Toggle}
            >
                Meny
            </PosisjonertMenyknapp>
            <StyledDropdownMenu>
                <Dropdown.Menu.List>
                    <MenyvalgFagsak minimalFagsak={minimalFagsak} />
                    {skalViseMenyvalgForBehandling && <Dropdown.Menu.Divider />}
                    {skalViseMenyvalgForBehandling && (
                        <MenyvalgBehandling
                            minimalFagsak={minimalFagsak}
                            åpenBehandling={åpenBehandling.data}
                        />
                    )}
                </Dropdown.Menu.List>
            </StyledDropdownMenu>
        </Dropdown>
    );
};

export default Behandlingsmeny;
