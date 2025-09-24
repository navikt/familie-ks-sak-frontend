import { Tabs } from '@navikt/ds-react';

import { useBehandlingContext } from '../../../sider/Fagsak/Behandling/context/BehandlingContext';
import IkonDokumenter from '../ikoner/IkonDokumenter';
import IkonHistorikk from '../ikoner/IkonHistorikk';
import IkonMeldinger from '../ikoner/IkonMeldinger';
import IkonTotrinnskontroll from '../ikoner/IkonTotrinnskontroll';
import { TabValg } from '../typer';
import styles from './Header.module.css';

interface IProps {
    skalViseTotrinnskontroll: boolean;
}

const Header = ({ skalViseTotrinnskontroll }: IProps) => {
    const { vurderErLesevisning } = useBehandlingContext();

    return (
        <Tabs.List className={styles.tabsListe}>
            <>
                {skalViseTotrinnskontroll && (
                    <Tabs.Tab
                        value={TabValg.Totrinnskontroll}
                        label={TabValg.Totrinnskontroll}
                        icon={<IkonTotrinnskontroll />}
                    />
                )}
                <Tabs.Tab value={TabValg.Historikk} label={TabValg.Historikk} icon={<IkonHistorikk />} />
                <Tabs.Tab value={TabValg.Dokumenter} label={TabValg.Dokumenter} icon={<IkonDokumenter />} />
                {!vurderErLesevisning() && (
                    <Tabs.Tab value={TabValg.Meldinger} label={'Send brev'} icon={<IkonMeldinger />} />
                )}
            </>
        </Tabs.List>
    );
};

export default Header;
