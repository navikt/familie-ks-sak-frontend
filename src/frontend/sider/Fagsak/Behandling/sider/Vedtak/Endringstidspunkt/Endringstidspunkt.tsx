import { useEndringstidspunktDialogContext } from '@sider/Fagsak/Behandling/sider/Vedtak/Endringstidspunkt/EndringstidspunktDialogContext';

import { CalendarIcon } from '@navikt/aksel-icons';
import { ActionMenu } from '@navikt/ds-react';

export function Endringstidspunkt() {
    const { åpneDialog } = useEndringstidspunktDialogContext();

    return (
        <ActionMenu.Item onClick={åpneDialog}>
            <CalendarIcon fontSize={'1.4rem'} />
            Oppdater endringstidspunkt
        </ActionMenu.Item>
    );
}
