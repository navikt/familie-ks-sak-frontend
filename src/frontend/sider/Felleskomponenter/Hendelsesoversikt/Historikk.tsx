import React from 'react';

import styled from 'styled-components';

import { Tabs } from '@navikt/ds-react';

import HendelseItem from './komponenter/HendelseItem';
import { TabValg, type Hendelse } from './typer';

const StyledPanel = styled(Tabs.Panel)`
    overflow: auto;
    max-width: 35rem;
`;

const Liste = styled.ul`
    min-height: 3.125rem;
    list-style: none;
    padding-left: 1.25rem;
`;

interface IProps {
    hendelser: Hendelse[];
}

const Historikk: React.FC<IProps> = ({ hendelser }) => (
    <StyledPanel value={TabValg.Historikk}>
        <Liste>
            {hendelser?.map((hendelse: Hendelse) => (
                <HendelseItem key={hendelse.id} hendelse={hendelse} />
            ))}
        </Liste>
    </StyledPanel>
);

export default Historikk;
