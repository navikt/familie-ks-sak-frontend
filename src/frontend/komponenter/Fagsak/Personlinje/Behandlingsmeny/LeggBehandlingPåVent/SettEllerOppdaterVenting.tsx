import React, { useState } from 'react';

import { Dropdown } from '@navikt/ds-react';

import { SettBehandlingPåVentModal } from './SettBehandlingPåVentModal';
import type { IBehandling } from '../../../../../typer/behandling';
import { BehandlingStatus } from '../../../../../typer/behandling';

interface IProps {
    behandling: IBehandling;
}

const SettEllerOppdaterVenting: React.FC<IProps> = ({ behandling }) => {
    const [visModal, settVisModal] = useState<boolean>(!!behandling.behandlingPåVent);

    const erBehandlingAlleredePåVent = !!behandling.behandlingPåVent;

    return (
        <>
            <Dropdown.Menu.List.Item
                onClick={() => settVisModal(true)}
                disabled={behandling.status !== BehandlingStatus.UTREDES}
            >
                {erBehandlingAlleredePåVent
                    ? 'Endre ventende behandling'
                    : 'Sett behandling på vent'}
            </Dropdown.Menu.List.Item>

            {visModal && (
                <SettBehandlingPåVentModal
                    lukkModal={() => settVisModal(false)}
                    behandling={behandling}
                />
            )}
        </>
    );
};

export default SettEllerOppdaterVenting;
