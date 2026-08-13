import { useFagsak } from '@hooks/useFagsak';
import { erFagsakLåst } from '@utils/fagsak';

import { ActionMenu } from '@navikt/ds-react';

interface Props {
    åpneModal: () => void;
}

export function OpprettBehandling({ åpneModal }: Props) {
    const fagsak = useFagsak();

    if (erFagsakLåst(fagsak)) {
        return null;
    }

    return <ActionMenu.Item onSelect={åpneModal}>Opprett behandling</ActionMenu.Item>;
}
