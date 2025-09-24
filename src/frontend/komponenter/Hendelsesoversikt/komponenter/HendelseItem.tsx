import { BodyShort } from '@navikt/ds-react';

import { BehandlerRolle, behandlerRoller } from '../../../typer/behandling';
import type { Hendelse } from '../typer';
import styles from './HendelseItem.module.css';

interface IHendelseItemProps {
    hendelse: Hendelse;
}

const HendelseItem = ({ hendelse }: IHendelseItemProps) => (
    <li className={styles.listElement}>
        <BodyShort weight="semibold">{hendelse.tittel}</BodyShort>
        {hendelse.beskrivelse && <BodyShort>{hendelse.beskrivelse}</BodyShort>}
        <BodyShort textColor="subtle">{`${hendelse.dato}`}</BodyShort>
        <BodyShort textColor="subtle">{`${hendelse.utførtAv} ${
            hendelse.rolle.toString() !== BehandlerRolle[BehandlerRolle.SYSTEM] && behandlerRoller[hendelse.rolle]
                ? `(${behandlerRoller[hendelse.rolle].navn})`
                : ''
        }`}</BodyShort>
    </li>
);

export default HendelseItem;
