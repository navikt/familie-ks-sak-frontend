import * as React from 'react';

import styled from 'styled-components';

import Dokumenterknapp from './Dokumenterknapp';
import Historikkknapp from './Historikkknapp';
import Meldingerknapp from './Meldingerknapp';
import TotrinnskontrollKnapp from './TotrinnskontrollKnapp';
import { useBehandling } from '../../../../context/behandlingContext/BehandlingContext';
import { Tabs } from '../typer';

interface IProps {
    aktivTab: Tabs;
    settAktivTab: (tab: Tabs) => void;
    skalViseTotrinnskontroll: boolean;
}

const StyledHeader = styled.header`
    height: 4rem;
    margin-bottom: 1rem;
    display: flex;
`;

const Header = ({ aktivTab, settAktivTab, skalViseTotrinnskontroll }: IProps) => {
    const { vurderErLesevisning } = useBehandling();

    return (
        <StyledHeader>
            {skalViseTotrinnskontroll && (
                <TotrinnskontrollKnapp
                    aktiv={aktivTab === Tabs.Totrinnskontroll}
                    onClick={() => settAktivTab(Tabs.Totrinnskontroll)}
                />
            )}
            <Historikkknapp
                aktiv={aktivTab === Tabs.Historikk}
                onClick={() => settAktivTab(Tabs.Historikk)}
            />
            <Dokumenterknapp
                aktiv={aktivTab === Tabs.Dokumenter}
                onClick={() => settAktivTab(Tabs.Dokumenter)}
            />
            <Meldingerknapp
                aktiv={aktivTab === Tabs.Meldinger}
                disabled={vurderErLesevisning()}
                onClick={() => settAktivTab(Tabs.Meldinger)}
            />
        </StyledHeader>
    );
};

export default Header;
