import React from 'react';

import { useNavigate } from 'react-router-dom';

import { Dropdown } from '@navikt/ds-react';

import OpprettBehandling from './OpprettBehandling/OpprettBehandling';
import type { IMinimalFagsak } from '../../../../typer/fagsak';

interface IProps {
    minimalFagsak: IMinimalFagsak;
}

const MenyvalgFagsak = ({ minimalFagsak }: IProps) => {
    const navigate = useNavigate();

    return (
        <>
            <OpprettBehandling minimalFagsak={minimalFagsak} />
            <Dropdown.Menu.List.Item
                onClick={() => navigate(`/fagsak/${minimalFagsak.id}/dokumentutsending`)}
            >
                Send informasjonsbrev
            </Dropdown.Menu.List.Item>
        </>
    );
};

export default MenyvalgFagsak;
