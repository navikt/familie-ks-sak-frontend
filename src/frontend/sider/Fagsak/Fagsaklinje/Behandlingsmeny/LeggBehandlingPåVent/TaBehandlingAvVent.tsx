import { ActionMenu } from '@navikt/ds-react';

import { useBehandlingContext } from '../../../Behandling/context/BehandlingContext';

interface Props {
    åpneModal: () => void;
}

export function TaBehandlingAvVent({ åpneModal }: Props) {
    const { behandling } = useBehandlingContext();

    if (behandling.behandlingPåVent === undefined || behandling.behandlingPåVent === null) {
        return null;
    }

    return <ActionMenu.Item onSelect={åpneModal}>Fortsett behandling</ActionMenu.Item>;
}
