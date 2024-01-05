import React, { useState } from 'react';

import { Calender } from '@navikt/ds-icons';
import { Dropdown } from '@navikt/ds-react';

import { OppdaterEndringstidspunktModal } from './OppdaterEndringstidspunktModal';
import type { IBehandling } from '../../../../typer/behandling';

const EndreEndringstidspunkt: React.FC<{
    åpenBehandling: IBehandling;
}> = ({ åpenBehandling }) => {
    const [visModal, settVisModal] = useState(false);

    return (
        <>
            <Dropdown.Menu.List.Item
                onClick={() => {
                    settVisModal(true);
                }}
            >
                <Calender />
                Oppdater endringstidspunkt
            </Dropdown.Menu.List.Item>

            {visModal && (
                <OppdaterEndringstidspunktModal
                    lukkModal={() => settVisModal(false)}
                    åpenBehandling={åpenBehandling}
                />
            )}
        </>
    );
};

export default EndreEndringstidspunkt;
