import styled from 'styled-components';

import HendelseItem from './komponenter/HendelseItem';
import { type Hendelse } from './typer';

const Liste = styled.ul`
    min-height: 3.125rem;
    list-style: none;
    padding-left: 1.25rem;
`;

interface IProps {
    hendelser: Hendelse[];
}

const Historikk = ({ hendelser }: IProps) => (
    <Liste>
        {hendelser?.map((hendelse: Hendelse) => (
            <HendelseItem key={hendelse.id} hendelse={hendelse} />
        ))}
    </Liste>
);

export default Historikk;
