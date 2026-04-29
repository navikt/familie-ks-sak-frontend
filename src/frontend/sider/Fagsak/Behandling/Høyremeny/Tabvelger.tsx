import { Tabs } from '@navikt/ds-react';

import IkonHistorikk from './Ikoner/IkonHistorikk';
import IkonMeldinger from './Ikoner/IkonMeldinger';
import IkonTotrinnskontroll from './Ikoner/IkonTotrinnskontroll';
import { Tab } from './TabContextProvider';
import styles from './Tabvelger.module.css';
import { useSkalViseTotrinnskontroll } from './useSkalViseTotrinnskontroll';
import { useBehandlingContext } from '../context/BehandlingContext';

export function Tabvelger() {
    const { vurderErLesevisning } = useBehandlingContext();
    const skalViseTotrinnskontroll = useSkalViseTotrinnskontroll();

    const erLesevisning = vurderErLesevisning();

    return (
        <Tabs.List className={styles.tabsListe}>
            {skalViseTotrinnskontroll && (
                <Tabs.Tab value={Tab.Totrinnskontroll} label={Tab.Totrinnskontroll} icon={<IkonTotrinnskontroll />} />
            )}
            <Tabs.Tab value={Tab.Historikk} label={Tab.Historikk} icon={<IkonHistorikk />} />
            {!erLesevisning && <Tabs.Tab value={Tab.Meldinger} label={'Send brev'} icon={<IkonMeldinger />} />}
        </Tabs.List>
    );
}
