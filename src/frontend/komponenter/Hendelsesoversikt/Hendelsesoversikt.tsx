import { useState } from 'react';

import classNames from 'classnames';

import { Tabs } from '@navikt/ds-react';

import Brev from './BrevModul/Brev';
import Header from './Header/Header';
import Historikk from './Historikk';
import { Totrinnskontroll } from './Totrinnskontroll/Totrinnskontroll';
import type { Hendelse } from './typer';
import { TabValg } from './typer';
import { useAppContext } from '../../context/AppContext';
import { useBehandlingContext } from '../../sider/Fagsak/Behandling/context/BehandlingContext';
import { useBrukerContext } from '../../sider/Fagsak/BrukerContext';
import { BehandlerRolle, BehandlingStatus } from '../../typer/behandling';

interface IHendelsesoversiktProps {
    className?: string;
    hendelser: Hendelse[];
}

export function Hendelsesoversikt({ hendelser, className }: IHendelsesoversiktProps) {
    const { behandling } = useBehandlingContext();
    const { bruker } = useBrukerContext();
    const { hentSaksbehandlerRolle } = useAppContext();

    const skalViseTotrinnskontroll =
        BehandlerRolle.BESLUTTER === hentSaksbehandlerRolle() && behandling.status === BehandlingStatus.FATTER_VEDTAK;

    const [aktivTab, settAktivTab] = useState<TabValg>(
        skalViseTotrinnskontroll ? TabValg.Totrinnskontroll : TabValg.Historikk
    );

    return (
        <div className={classNames('hendelsesoversikt', className)}>
            <Tabs value={aktivTab} onChange={tab => settAktivTab(tab as TabValg)} iconPosition="top">
                <Header skalViseTotrinnskontroll={skalViseTotrinnskontroll} />

                {aktivTab === TabValg.Totrinnskontroll && (
                    <Tabs.Panel value={TabValg.Totrinnskontroll}>
                        <Totrinnskontroll />
                    </Tabs.Panel>
                )}
                {aktivTab === TabValg.Historikk && hendelser.length > 0 && <Historikk hendelser={hendelser} />}
                {aktivTab === TabValg.Meldinger && (
                    <Brev onIModalClick={() => settAktivTab(TabValg.Historikk)} bruker={bruker} />
                )}
            </Tabs>
        </div>
    );
}
