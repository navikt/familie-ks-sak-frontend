import { Tabs } from '@navikt/ds-react';

import { TabValg } from './Høyremeny';
import IkonDokumenter from './Ikoner/IkonDokumenter';
import IkonHistorikk from './Ikoner/IkonHistorikk';
import IkonMeldinger from './Ikoner/IkonMeldinger';
import IkonTotrinnskontroll from './Ikoner/IkonTotrinnskontroll';
import styles from './Tabvelger.module.css';
import { useBehandlingContext } from '../context/BehandlingContext';

interface Props {
    skalViseTotrinnskontroll: boolean;
}

export function Tabvelger({ skalViseTotrinnskontroll }: Props) {
    const { vurderErLesevisning } = useBehandlingContext();

    const erLesevisning = vurderErLesevisning();

    return (
        <Tabs.List className={styles.tabsListe}>
            {skalViseTotrinnskontroll && (
                <Tabs.Tab
                    value={TabValg.Totrinnskontroll}
                    label={TabValg.Totrinnskontroll}
                    icon={<IkonTotrinnskontroll />}
                />
            )}
            <Tabs.Tab value={TabValg.Historikk} label={TabValg.Historikk} icon={<IkonHistorikk />} />
            <Tabs.Tab value={TabValg.Dokumenter} label={TabValg.Dokumenter} icon={<IkonDokumenter />} />
            {!erLesevisning && <Tabs.Tab value={TabValg.Meldinger} label={'Send brev'} icon={<IkonMeldinger />} />}
        </Tabs.List>
    );
}
