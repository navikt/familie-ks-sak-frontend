import styled from 'styled-components';

import { BodyShort } from '@navikt/ds-react';

import Styles from './Historikk.module.css';
import { BehandlerRolle, behandlerRoller } from '../../../../../typer/behandling';

export interface Hendelse {
    id: string;
    dato: string;
    tittel: string;
    utførtAv: string;
    rolle: BehandlerRolle;
    beskrivelse?: string;
}

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
            <li key={hendelse.id} className={Styles.listElement}>
                <BodyShort weight="semibold">{hendelse.tittel}</BodyShort>
                {hendelse.beskrivelse && <BodyShort>{hendelse.beskrivelse}</BodyShort>}
                <BodyShort textColor="subtle">{`${hendelse.dato}`}</BodyShort>
                <BodyShort textColor="subtle">{`${hendelse.utførtAv} ${
                    hendelse.rolle.toString() !== BehandlerRolle[BehandlerRolle.SYSTEM] &&
                    behandlerRoller[hendelse.rolle]
                        ? `(${behandlerRoller[hendelse.rolle].navn})`
                        : ''
                }`}</BodyShort>
            </li>
        ))}
    </Liste>
);

export default Historikk;
