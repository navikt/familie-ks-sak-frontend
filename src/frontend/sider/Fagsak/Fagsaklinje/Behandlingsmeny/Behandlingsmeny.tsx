import styled from 'styled-components';

import { ChevronDownIcon } from '@navikt/aksel-icons';
import { Button, Dropdown } from '@navikt/ds-react';

import MenyvalgFagsak from './MenyvalgFagsak';
import MenyvalgBehandling from './OpprettFagsak/MenyvalgBehandling';
import { BehandlingStatus, type IBehandling } from '../../../../typer/behandling';
import type { IMinimalFagsak } from '../../../../typer/fagsak';

interface IProps {
    minimalFagsak: IMinimalFagsak;
    behandling?: IBehandling;
}

const PosisjonertMenyknapp = styled(Button)`
    margin-left: 3rem;
`;

const StyledDropdownMenu = styled(Dropdown.Menu)`
    width: 30ch;
`;

const Behandlingsmeny = ({ minimalFagsak, behandling }: IProps) => {
    const skalViseMenyvalgForBehandling = behandling && behandling.status !== BehandlingStatus.AVSLUTTET;

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
                        <MenyvalgBehandling minimalFagsak={minimalFagsak} behandling={behandling} />
                    )}
                </Dropdown.Menu.List>
            </StyledDropdownMenu>
        </Dropdown>
    );
};

export default Behandlingsmeny;
