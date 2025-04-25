import * as React from 'react';

import styled from 'styled-components';

import { Tabs } from '@navikt/ds-react';

import { useBehandlingContext } from '../../../sider/Fagsak/Behandling/sider/Vedtak/VedtakBegrunnelserTabell/Context/BehandlingContext';
import IkonDokumenter from '../ikoner/IkonDokumenter';
import IkonHistorikk from '../ikoner/IkonHistorikk';
import IkonMeldinger from '../ikoner/IkonMeldinger';
import IkonTotrinnskontroll from '../ikoner/IkonTotrinnskontroll';
import { TabValg } from '../typer';

interface IProps {
    skalViseTotrinnskontroll: boolean;
}

const FullBreddeTabListe = styled(Tabs.List)`
    width: 100%;
    > button {
        flex: 1;
    }
`;

const Header = ({ skalViseTotrinnskontroll }: IProps) => {
    const { vurderErLesevisning } = useBehandlingContext();

    return (
        <FullBreddeTabListe>
            {skalViseTotrinnskontroll && (
                <Tabs.Tab
                    value={TabValg.Totrinnskontroll}
                    label={TabValg.Totrinnskontroll}
                    icon={<IkonTotrinnskontroll />}
                />
            )}
            <Tabs.Tab
                value={TabValg.Historikk}
                label={TabValg.Historikk}
                icon={<IkonHistorikk />}
            />
            <Tabs.Tab
                value={TabValg.Dokumenter}
                label={TabValg.Dokumenter}
                icon={<IkonDokumenter />}
            />
            {!vurderErLesevisning() && (
                <Tabs.Tab value={TabValg.Meldinger} label={'Send brev'} icon={<IkonMeldinger />} />
            )}
        </FullBreddeTabListe>
    );
};

export default Header;
