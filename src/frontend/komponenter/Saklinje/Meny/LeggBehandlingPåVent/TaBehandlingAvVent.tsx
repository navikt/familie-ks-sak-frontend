import { useBehandling } from '@hooks/useBehandling';

import { ActionMenu } from '@navikt/ds-react';

interface Props {
    åpneModal: () => void;
}

export function TaBehandlingAvVent({ åpneModal }: Props) {
    const behandling = useBehandling();

    if (behandling.behandlingPåVent === undefined || behandling.behandlingPåVent === null) {
        return null;
    }

    return <ActionMenu.Item onSelect={åpneModal}>Fortsett behandling</ActionMenu.Item>;
}
