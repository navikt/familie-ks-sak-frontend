import { useRefusjonEøsTabellContext } from '@sider/Fagsak/Behandling/sider/Vedtak/RefusjonEøs/RefusjonEøsTabellContext';

import { StarsEuIcon } from '@navikt/aksel-icons';
import { ActionMenu } from '@navikt/ds-react';

export function RefusjonEøs() {
    const { visRefusjonEøsTabell } = useRefusjonEøsTabellContext();

    return (
        <ActionMenu.Item onClick={visRefusjonEøsTabell}>
            <StarsEuIcon fontSize={'1.4rem'} />
            Legg til refusjon EØS
        </ActionMenu.Item>
    );
}
