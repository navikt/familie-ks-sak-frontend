import React from 'react';

import styled from 'styled-components';

import { BodyShort } from '@navikt/ds-react';
import { ABgSubtle } from '@navikt/ds-tokens/dist/tokens';

import { BehandlerRolle, behandlerRoller } from '../../../../typer/behandling';
import type { Hendelse } from '../typer';

interface IHendelseItemProps {
    hendelse: Hendelse;
}

const Listeelement = styled.li`
    position: relative;
    margin: 0;
    padding: 0.75rem 0.75rem 0.75rem 2.25rem;

    &:before {
        position: absolute;
        content: '';
        height: 100%;
        width: 1px;
        background: ${ABgSubtle};
        top: 0;
        left: calc(0.5rem);
        transform: translateX(-0.5px);
    }

    &:after {
        position: absolute;
        content: '';
        background: white;
        border: 2px solid #59514b;
        height: 1rem;
        width: 1rem;
        border-radius: 50%;
        top: 0.75rem;
        left: 0;
    }

    &:first-of-type:before {
        top: 0.75rem;
        height: calc(100% - 0.75rem);
    }
`;

const HendelseItem = ({ hendelse }: IHendelseItemProps) => (
    <Listeelement>
        <BodyShort weight="semibold">{hendelse.tittel}</BodyShort>
        {hendelse.beskrivelse && <BodyShort>{hendelse.beskrivelse}</BodyShort>}
        <BodyShort textColor="subtle">{`${hendelse.dato}`}</BodyShort>
        <BodyShort textColor="subtle">{`${hendelse.utførtAv} ${
            hendelse.rolle.toString() !== BehandlerRolle[BehandlerRolle.SYSTEM] &&
            behandlerRoller[hendelse.rolle]
                ? `(${behandlerRoller[hendelse.rolle].navn})`
                : ''
        }`}</BodyShort>
    </Listeelement>
);

export default HendelseItem;
