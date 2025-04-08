import * as React from 'react';

import classNames from 'classnames';

import { Tabs } from '@navikt/ds-react';

import Brev from './BrevModul/Brev';
import Header from './Header/Header';
import Historikk from './Historikk';
import Totrinnskontroll from './Totrinnskontroll/Totrinnskontroll';
import type { Hendelse } from './typer';
import { TabValg } from './typer';
import { useApp } from '../../context/AppContext';
import { BehandlerRolle, BehandlingStatus } from '../../typer/behandling';
import type { IBehandling } from '../../typer/behandling';
import type { IPersonInfo } from '../../typer/person';

interface IHendelsesoversiktProps {
    className?: string;
    hendelser: Hendelse[];
    åpenBehandling: IBehandling;
    bruker: IPersonInfo;
}

const Hendelsesoversikt = ({
    hendelser,
    className,
    åpenBehandling,
    bruker,
}: IHendelsesoversiktProps) => {
    const { hentSaksbehandlerRolle } = useApp();

    const skalViseTotrinnskontroll =
        BehandlerRolle.BESLUTTER === hentSaksbehandlerRolle() &&
        åpenBehandling?.status === BehandlingStatus.FATTER_VEDTAK;

    const [aktivTab, settAktivTab] = React.useState<TabValg>(
        skalViseTotrinnskontroll ? TabValg.Totrinnskontroll : TabValg.Historikk
    );

    return (
        <div className={classNames('hendelsesoversikt', className)}>
            <Tabs
                value={aktivTab}
                onChange={tab => settAktivTab(tab as TabValg)}
                iconPosition="top"
            >
                <Header skalViseTotrinnskontroll={skalViseTotrinnskontroll} />

                {aktivTab === TabValg.Totrinnskontroll && (
                    <Tabs.Panel value={TabValg.Totrinnskontroll}>
                        <Totrinnskontroll åpenBehandling={åpenBehandling} />
                    </Tabs.Panel>
                )}
                {aktivTab === TabValg.Historikk && hendelser.length > 0 && (
                    <Historikk hendelser={hendelser} />
                )}
                {aktivTab === TabValg.Meldinger && (
                    <Brev onIModalClick={() => settAktivTab(TabValg.Historikk)} bruker={bruker} />
                )}
            </Tabs>
        </div>
    );
};

export default Hendelsesoversikt;
